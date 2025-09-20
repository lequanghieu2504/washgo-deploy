package com.example.washgo.controller;

import com.example.washgo.dtos.*;
import com.example.washgo.model.RefreshToken;
import com.example.washgo.model.UserAccount;
import com.example.washgo.enums.UserRole;
import com.example.washgo.service.CookiesService;
import com.example.washgo.security.JwtService; // <-- import your JwtService
import com.example.washgo.service.AuthService;
import com.example.washgo.service.GoogleOAuthService;
import com.example.washgo.service.RefreshTokenService;
import com.example.washgo.service.UserRegistrationService;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService; // ✅ Inject JwtService
    private final RefreshTokenService refreshTokenService; // ✅ Inject RefreshTokenService
    private final GoogleOAuthService googleOAuthService; // ✅ Inject GoogleOAuthService
    private final UserRegistrationService userRegistrationService;
    private final CookiesService cookiesService;
    public AuthController(CookiesService cookiesService, UserRegistrationService userRegistrationService,AuthService authService, JwtService jwtService, RefreshTokenService refreshTokenService, GoogleOAuthService googleOAuthService) {
        this.authService = authService;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
        this.googleOAuthService = googleOAuthService;
        this.userRegistrationService = userRegistrationService;
        this.cookiesService = cookiesService;
    }

//    // ✅ Register via JSON
//    @PostMapping("/register")
//    public String register(@RequestBody RegisterRequest request) {
//        UserAccount user = authService.register(request.getUsername(), request.getEmail(),
//                request.getPassword(), request.getRole());
//        return "Registered: " + user.getUsername();
//    }

//    // ✅ Login returns JWT token
//    @PostMapping("/login")
//    public String login(@RequestBody LoginRequest request) {
//        UserInformation u = authService.loginWithPassword(request.getUsername(), request.getPassword());
//        if (u != null) {
//            String token = jwtService.generateToken(u.getUsername(), u.getRole().toString());
//            return token;
//        } else {
//            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
//        }
//    }
@GetMapping("/google/callback")
public Map<String, String> googleCallback(@RequestParam String code) throws Exception {
    JsonNode userInfo = googleOAuthService.getUserInfo(code);
    String email = userInfo.get("email").asText();
    String googleId = userInfo.get("sub").asText();

    // Try to login or register if not exists
    UserAccount user = authService.loginWithGoogle(googleId);
    if (user == null) {
        user = authService.register("google_" + googleId, email, "N/A", UserRole.CLIENT);
        user.setGoogleId(googleId);
        authService.save(user);
    }

    // Issue tokens
    String accessToken = jwtService.generateToken(user.getUsername(), user.getUser().getRole().toString(), user.getId());
    RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

    return Map.of(
            "accessToken", accessToken,
            "refreshToken", refreshToken.getToken()
    );
}

@GetMapping("/google/callbackFromGoogle")
public ResponseEntity<?> callbackFromGoogle(@RequestParam String code) {
    try {
        // 1. Lấy token response (access_token, refresh_token, id_token...)
        JsonNode tokenResponse = googleOAuthService.getTokenResponse(code);

        String accessToken = tokenResponse.has("access_token") ? tokenResponse.get("access_token").asText() : null;
        String refreshToken = tokenResponse.has("refresh_token") ? tokenResponse.get("refresh_token").asText() : null;
        String idToken = tokenResponse.has("id_token") ? tokenResponse.get("id_token").asText() : null;

        // 2. (Tuỳ chọn) Lấy thông tin user từ access token
        JsonNode userInfo = null;
        if (accessToken != null) {
            userInfo = googleOAuthService.getUserInfo(accessToken);
        }

        // 3. Trả về dữ liệu cho client
        Map<String, Object> result = new HashMap<>();
        result.put("access_token", accessToken);
        result.put("refresh_token", refreshToken);
        result.put("id_token", idToken);
        result.put("user_info", userInfo);

        return ResponseEntity.ok(result);

    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to get tokens or user info", "details", e.getMessage()));
    }
}


    @PostMapping("/login-google")
    public String loginGoogle(@RequestBody GoogleLoginRequest request) {
        UserAccount u = authService.loginWithGoogle(request.getGoogleId());
        return (u != null) ? "Logged in with Google" : "Google ID not found";
    }

    @PostMapping("/update")
    public String updateAccount() {
        return "Account updated";
    }

    @PostMapping("/logout")
    public String logout(@CookieValue(value = "refreshTokenSetBySystem", required = false) String requestRefreshToken,HttpServletResponse response) {
        System.out.println(requestRefreshToken);
        refreshTokenService.deleteByToken(requestRefreshToken);
        cookiesService.deleteRefreshTokenFromCookies(response);
        return "Refresh token deleted successfully. Logged out.";
    }


    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request, HttpServletResponse response) {
        UserAccount user = authService.loginWithPassword(request.getUsername(), request.getPassword());
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        String accessToken = jwtService.generateToken(
                user.getUsername(),
                user.getUser().getRole().toString(),
                user.getId()
        );
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);
        System.out.println(refreshToken.getToken());
        // Lưu refreshToken trong HttpOnly Cookie thay vì trả về body
        Cookie cookies = cookiesService.CookiesConfig(7 * 24 * 60 * 60, new Cookie("refreshToken", refreshToken.getToken()));

        response.addCookie(cookies);

        // Trả về accessToken cho client (frontend sẽ giữ trong memory)
        return ResponseEntity.ok(Map.of("accessToken", accessToken));
    }


    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(
            @CookieValue(value = "refreshToken", required = false) String requestRefreshToken,
            HttpServletResponse response) {

        if (requestRefreshToken == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Refresh token is missing");
        }
        System.out.println("your refresh token: "+requestRefreshToken);
        return refreshTokenService
                .findByToken(requestRefreshToken)
                .flatMap(refreshTokenService::verifyExpiration)
                .map(refreshToken -> {
                    UserAccount user = refreshToken.getUser();

                    // Sinh access token mới
                    String newAccessToken = jwtService.generateToken(
                            user.getUsername(),
                            user.getUser().getRole().toString(),
                            user.getId()
                    );


                    // Trả về access token cho FE
                    return ResponseEntity.ok(Map.of("accessToken", newAccessToken));
                })
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.FORBIDDEN, "Refresh token not found or expired"
                ));
    }






    @GetMapping("/login-google-url")
    public String getGoogleLoginUrl() {
        return googleOAuthService.getGoogleLoginUrl();
    }




}

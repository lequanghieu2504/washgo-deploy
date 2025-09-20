package com.example.washgo.controller;
// Controller
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// Service, DTO, Entity, Repository, Utils
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

import com.example.washgo.dtos.UserCreateDTO;
import com.example.washgo.model.UserEmail;
import com.example.washgo.repository.UserEmailRepository;
import com.example.washgo.service.UserRegistrationService;
import com.fasterxml.jackson.databind.ObjectMapper;



// Nếu bạn dùng Pattern cho regex email (nếu có)
import java.util.regex.Pattern;


@RestController
@RequestMapping("/mail")
public class EmailController {

    @Autowired
    private UserRegistrationService registrationService; // chỗ bạn để các method bạn vừa viết

    // API gửi email xác minh (tạo token)
    @PostMapping("/send-verification")
    public ResponseEntity<?> sendVerificationEmail(@RequestBody Map<String, String> body) {
        try {
            String email = body.get("email");
            String password = body.get("password");
            String role = body.get("role");
            String phone = body.get("phonenumber");

            // Check for null or empty fields
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Email is required and cannot be empty"));
            }
            if (password == null || password.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Password is required and cannot be empty"));
            }
            if (role == null || role.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Role is required and cannot be empty"));
            }
            if (phone == null || phone.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Phone number is required and cannot be empty"));
            }

            // Check if role is valid (e.g., only "client" allowed)
            if (!"client".equalsIgnoreCase(role)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "You are not allowed to perform this action. Only clients can create bookings."));
            }

            registrationService.createVerificationTokenAndSendEmail(email, password, role, phone);
            return ResponseEntity.status(HttpStatus.OK)
                    .body(Map.of("message", "Verification email sent successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error sending verification email due to an internal server issue"));
        }
    }

    // API xác nhận token
    @GetMapping("/verify-email")
    public ResponseEntity<?> verifyEmailToken(@RequestParam("otp") String token) {
        boolean isVerified = registrationService.verifyRegisterOTP(token);
        if (isVerified) {
            return ResponseEntity.ok("Email verified successfully");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid or expired token");
        }
    }
    
    @PostMapping("/forgotPassword")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            if (email == null || email.isEmpty()) {
                return ResponseEntity.badRequest().body("Email is required");
            }
            
            registrationService.forgotPasswordByEmail(email);
            return ResponseEntity.ok("OTP for password reset has been sent to your email your OTP: "+registrationService.forgotPasswordByEmail(email));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error while processing forgot password");
        }
    }
    @GetMapping("/verify-forgot-password")
    public ResponseEntity<?> verifyForgotPassword(@RequestParam("OTP") String otp) {
        boolean isValid = registrationService.verifyForgotPasswordOTP(otp);

        if (isValid) {
            return ResponseEntity.ok("OTP is valid. You can now reset your password.");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid or expired OTP.");
        }
    }

    
    
}

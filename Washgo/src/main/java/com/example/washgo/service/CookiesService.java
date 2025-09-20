package com.example.washgo.service;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Service;
import com.example.washgo.util.httpConfig;
@Service
public class CookiesService {

    public Cookie CookiesConfig(int maxAge,Cookie cookie) {
        return httpConfig.CookiesConfig(maxAge,cookie);
    }

    public Cookie getCookie(HttpServletRequest request) {
        return request.getCookies()[0];
    }

        public void deleteRefreshTokenFromCookies(HttpServletResponse response) {
            Cookie cookie = new Cookie("refreshToken", null);
            cookie.setPath("/"); // Đảm bảo path khớp với lúc tạo cookie
            cookie.setMaxAge(0); // Đặt tuổi thọ về 0 để xóa
            cookie.setHttpOnly(true); // Nếu bạn đã đặt HttpOnly khi tạo, nên giữ lại
            response.addCookie(cookie);
        }
    }


package com.example.washgo.util;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;

import java.net.HttpCookie;
import java.util.UUID;

public class httpConfig {
    public static Cookie CookiesConfig(int maxAge,Cookie cookie) {
        cookie.setHttpOnly(true);        // không cho JS truy cập
        cookie.setSecure(true);          // bật khi deploy HTTPS
        cookie.setPath("/");             // cookie áp dụng cho toàn bộ domain
        cookie.setMaxAge(maxAge); // 7 ngày
        return cookie;
    }
}
package com.sondv.phone.util;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Optional;

public class CookieUtil {
    private static final Logger logger = LoggerFactory.getLogger(CookieUtil.class);

    private static boolean isProduction() {
        return "production".equalsIgnoreCase(System.getenv().getOrDefault("ENVIRONMENT", "development"));
    }

    public static void addCookie(HttpServletResponse response, String name, String value, int maxAge, boolean httpOnly, String sameSite) {
        logger.info("🔧 Adding cookie: name={}, maxAge={}, httpOnly={}, sameSite={}", name, maxAge, httpOnly, sameSite);

        Cookie cookie = new Cookie(name, value);
        cookie.setHttpOnly(httpOnly);
        cookie.setSecure(isProduction()); // Chỉ bật Secure ở production
        cookie.setPath("/");
        cookie.setMaxAge(maxAge);
        // Không đặt Domain khi chạy local để tránh vấn đề với localhost
        if (isProduction()) {
            cookie.setDomain(System.getenv().getOrDefault("COOKIE_DOMAIN", "dsonmobile.shop"));
        }

        StringBuilder cookieHeader = new StringBuilder();
        cookieHeader.append(String.format("%s=%s; Path=/; Max-Age=%d; ", name, value, maxAge));
        if (httpOnly) cookieHeader.append("HttpOnly; ");
        if (isProduction()) cookieHeader.append("Secure; ");
        cookieHeader.append("SameSite=").append(sameSite);

        String cookieString = cookieHeader.toString();
        logger.info("🍪 Set-Cookie header: {}", cookieString);

        response.addHeader("Set-Cookie", cookieString);
        response.addCookie(cookie);
        // Thêm header CORS
        response.addHeader("Access-Control-Allow-Credentials", "true");
        response.addHeader("Access-Control-Allow-Origin", isProduction() ? "https://dsonmobile.shop" : "http://localhost:3000");
    }

    public static void addCookie(HttpServletResponse response, String name, String value, int maxAge, boolean httpOnly) {
        String sameSite = isProduction() ? "None" : "Lax"; // Dùng Lax cho local
        addCookie(response, name, value, maxAge, httpOnly, sameSite);
    }

    public static void addCookie(HttpServletResponse response, String name, String value, int maxAge) {
        addCookie(response, name, value, maxAge, true);
    }

    public static Optional<String> getCookieValue(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (cookie.getName().equals(name)) {
                    logger.info("🔍 Found cookie: {}={}", name, cookie.getValue());
                    return Optional.of(cookie.getValue());
                }
            }
        }
        logger.warn("⚠️ Cookie not found: {}", name);
        return Optional.empty();
    }

    public static void clearCookie(HttpServletResponse response, String name) {
        logger.info("🧹 Clearing cookie: {}", name);

        Cookie cookie = new Cookie(name, "");
        cookie.setHttpOnly(true);
        cookie.setSecure(isProduction());
        cookie.setPath("/");
        cookie.setMaxAge(0);
        if (isProduction()) {
            cookie.setDomain(System.getenv().getOrDefault("COOKIE_DOMAIN", "dsonmobile.shop"));
        }

        StringBuilder clearHeader = new StringBuilder();
        clearHeader.append(String.format("%s=; Path=/; Max-Age=0; HttpOnly; "));
        if (isProduction()) clearHeader.append("Secure; ");
        clearHeader.append("SameSite=").append(isProduction() ? "None" : "Lax");

        String cookieString = clearHeader.toString();
        logger.info("🍪 Clear-Cookie header: {}", cookieString);

        response.addHeader("Set-Cookie", cookieString);
        response.addCookie(cookie);
        response.addHeader("Access-Control-Allow-Credentials", "true");
        response.addHeader("Access-Control-Allow-Origin", isProduction() ? "https://dsonmobile.shop" : "http://localhost:3000");
    }
}
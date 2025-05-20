package com.sondv.phone.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
public class WebConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer(
            @Value("${FRONTEND_BASE_URL:https://dsonmobile.shop}") String frontendUrl,
            @Value("${FRONTEND_DEV_URL:http://localhost:3000}") String devUrl) {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                System.out.println("🌐 CORS Configuration:");
                System.out.println("Frontend URL: " + frontendUrl);
                System.out.println("Dev URL: " + devUrl);

                registry.addMapping("/**")
                        .allowedOrigins(frontendUrl, devUrl, "http://localhost:3000")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .exposedHeaders("Set-Cookie", "Authorization")
                        .allowCredentials(true)
                        .maxAge(3600);

                System.out.println("✅ CORS configured with:");
                System.out.println(
                        "- Allowed Origins: " + String.join(", ", frontendUrl, devUrl, "http://localhost:3000"));
                System.out.println("- Allowed Methods: GET, POST, PUT, DELETE, OPTIONS");
                System.out.println("- Exposed Headers: Set-Cookie, Authorization");
                System.out.println("- Allow Credentials: true");
            }
        };
    }
}

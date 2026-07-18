package com.substring.chat.config;

import java.util.Arrays;

public class AppConstants {
    private AppConstants() {
    }

    public static final String[] FRONT_END_ORIGIN_PATTERNS = getFrontendOriginPatterns();

    public static String[] getFrontendOriginPatterns() {
        String configuredOrigins = System.getProperty(
                "FRONT_END_ORIGIN_PATTERNS",
                System.getenv().getOrDefault(
                        "FRONT_END_ORIGIN_PATTERNS",
                        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:4173,https://chat-app-708i.onrender.com,https://*.onrender.com"
                )
        );

        return Arrays.stream(configuredOrigins.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isEmpty())
                .toArray(String[]::new);
    }
}

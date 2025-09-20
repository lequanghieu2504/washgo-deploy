package com.example.washgo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class FileUploadConfig implements WebMvcConfigurer {

    public static final long MAX_IMAGE_SIZE = 6 * 1024 * 1024; // 6MB
    public static final long MAX_VIDEO_SIZE = 300 * 1024 * 1024; // 300MB
    public static final String UPLOAD_DIR = "uploads";

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
    }
}

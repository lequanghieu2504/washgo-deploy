// src/main/java/com/example/washgo/dtos/CarwashDTO.java
package com.example.washgo.dtos;

import lombok.Data;

@Data
public class CarwashDTO {
    private Long id;
    private String username;
    private String email;
    private String role;
    private String carwashName;
    private String location;
    private String description;
    private Double averageRating;
    private Integer ratingCount;
    private String phoneNumber;
    // --- Changed to String ---
    private String latitude;
    private String longitude;
    // --- End Change ---
}

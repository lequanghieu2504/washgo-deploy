package com.example.washgo.dtos;

import java.time.LocalTime;

import lombok.Data;

@Data
public class CarwashFilterListDTO {
    private Long id;
    private String carwashName;
    private String location;
    private String description;
    private Double averageRating;
    private String phoneNumber;
    
    private LocalTime from;
    private LocalTime to;
 
    private String longitude;
    private String latitude;
}

package com.example.washgo.dtos;

import lombok.Data;

@Data
public class CarwashOwnerRegistrationRequest {
    private String username;
    private String email;
    private String password;
    private String carwashName;
    private String location;
    private String description;
}

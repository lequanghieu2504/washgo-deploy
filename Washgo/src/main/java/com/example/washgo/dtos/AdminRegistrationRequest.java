package com.example.washgo.dtos;

import lombok.Data;

@Data
public class AdminRegistrationRequest {
    private String username;
    private String email;
    private String password;
}

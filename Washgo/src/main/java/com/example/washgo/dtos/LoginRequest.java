// src/main/java/com/example/washgo/dtos/LoginRequest.java
package com.example.washgo.dtos;

import lombok.Data;

@Data
public class LoginRequest {
    private String username;
    private String password;
}
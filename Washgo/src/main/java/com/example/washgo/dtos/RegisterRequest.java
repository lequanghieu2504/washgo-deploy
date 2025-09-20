// src/main/java/com/example/washgo/dtos/RegisterRequest.java
package com.example.washgo.dtos;

import com.example.washgo.enums.UserRole;
import lombok.Data;

@Data
public class RegisterRequest {
    private String username;
    private String email;
    private String password;
    private UserRole role;
}
package com.example.washgo.dtos;

import com.example.washgo.enums.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * DTO for creating a new user.
 */
@Data
public class UserCreateDTO {

    @NotBlank(message = "Username cannot be blank")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;

    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Email should be valid")
    private String email;

    @NotBlank(message = "Password cannot be blank")
    @Size(min = 8, message = "Password must be at least 8 characters long")
    private String password; // Raw password

    @NotNull(message = "User role cannot be null")
    private UserRole role;

    // Optional fields for CARWASH role
    private String carwashName;
    private String location;
    private String description;
    private String phonenumber;
}
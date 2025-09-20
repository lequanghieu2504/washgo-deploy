package com.example.washgo.dtos;

// Removed Email and Size imports as they are no longer used here
import lombok.Data;
import java.util.Optional;

/**
 * DTO for updating user information. All fields are optional.
 * Validation annotations are removed from Optional fields and handled in the service layer.
 */
@Data
public class UserUpdateDTO {

    // REMOVED: @Email(message = "Email should be valid")
    private Optional<String> email = Optional.empty();

    // REMOVED: @Size(min = 8, message = "Password must be at least 8 characters long")
    private Optional<String> password = Optional.empty(); // Raw password

    // Optional Carwash Profile Updates
    private Optional<String> carwashName = Optional.empty();
    private Optional<String> location = Optional.empty();
    private Optional<String> description = Optional.empty();

    // No specific fields needed for Client/Admin profiles in this DTO
}

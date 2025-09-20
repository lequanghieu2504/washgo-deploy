package com.example.washgo.dtos;

import com.example.washgo.enums.UserRole;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UserReadDTO {
    private Long id;
    private String username;
    private String email;
    private UserRole role;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private ClientProfileDTO clientProfile;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private CarwashProfileDTO carwashProfile;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private AdminProfileDTO adminProfile;

    /** Nested DTO for Client Profile information. */
    @Data
    public static class ClientProfileDTO {
        // Empty
    }

    /** Nested DTO for Carwash Profile information. */
    @Data
    public static class CarwashProfileDTO {
        private String carwashName;
        private String location;
        private String description;
        // --- Changed to String ---
        private String latitude;
        private String longitude;
        // --- End Change ---
        private Double averageRating;
        private Integer ratingCount;
    }

    /** Nested DTO for Admin Profile information. */
    @Data
    public static class AdminProfileDTO {
        // Empty
    }
}

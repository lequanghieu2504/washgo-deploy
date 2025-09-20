// src/main/java/com/example/washgo/dtos/FeedbackReadDTO.java
package com.example.washgo.dtos;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackReadDTO {
    private Long id;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;

    private Long bookingId;

    private Long carwashId;
    private String carwashName;

    private Long clientId;
    private String clientUsername;

    private List<MediaDTO> media;
}
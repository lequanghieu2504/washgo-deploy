// src/main/java/com/example/washgo/dtos/FeedbackDTO.java
package com.example.washgo.dtos;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackRequestDTO {
    private Long bookingId;
    private Integer rating;
    private String comment;
    private Long carwashID;
}

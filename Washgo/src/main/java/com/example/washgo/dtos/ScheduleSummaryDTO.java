// src/main/java/com/example/washgo/dtos/ScheduleSummaryDTO.java
package com.example.washgo.dtos;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleSummaryDTO {
    private Long id;
    private LocalTime availableFrom;
    private LocalTime availableTo;
    private int capacity; // --- ADDED ---
}
package com.example.washgo.dtos;

import java.time.LocalDateTime;
import lombok.Data;

@Data
public class BookingRequestDTO {
    private String latitude;
    private String longitude;
    private String category;
    private LocalDateTime requestedTime;
}
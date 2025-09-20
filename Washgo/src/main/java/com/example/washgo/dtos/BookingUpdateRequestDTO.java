package com.example.washgo.dtos;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class BookingUpdateRequestDTO {
	 	private String status;     
	    private LocalDateTime newEndTime;    
	    private LocalDateTime newStartTime;     
}

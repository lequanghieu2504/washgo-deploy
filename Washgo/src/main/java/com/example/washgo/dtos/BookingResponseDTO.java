package com.example.washgo.dtos;

import java.time.LocalDateTime;
import java.util.List;

import com.example.washgo.enums.BookingStatus;

import lombok.Data;
@Data
public class BookingResponseDTO {
    public long bookingId;
	public String notes;

	private LocalDateTime startTime;
    private LocalDateTime endTime;

    private List<ProductDTO> listProductDTO;

	private    double FinalPrice;

	private String currency;

	private BookingStatus bookingStatus;
}

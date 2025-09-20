	package com.example.washgo.dtos;
	
	import java.time.LocalDateTime;
	import java.util.List;
	
	import lombok.Data;
	
	@Data
	public class BookingDTO {
	    private Long bookingId;
	    private String notes;

	    private LocalDateTime startTime;
	    private LocalDateTime endTime;
	    
	    private List<Long> productsId; 
	
	    private Long userId;     
	    private Long carwashId;
	    
	    private Long couponId;   
	    private PaymentDTO payment; 
	    
	    
	    private String phoneNumber;
	    
	    private List<ProductDTO> listProductDTO;
	    
	    private String status;
	    
	}

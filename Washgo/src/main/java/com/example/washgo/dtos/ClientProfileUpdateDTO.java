	package com.example.washgo.dtos;
	
	import java.time.LocalDate;
	
	import lombok.Data;
	
	@Data
	public class ClientProfileUpdateDTO {
	    private Long userId;
		private String userName;
	    private String gender;
	    private LocalDate birthDay;
	}

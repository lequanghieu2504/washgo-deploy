package com.example.washgo.dtos;

import java.time.LocalDate;

import com.example.washgo.enums.GenderType;

import lombok.Data;
@Data
public class ClientProfileDTO {
	private Long id;
	private String userName;
	private String gmail;
	private String phonenumber;
	private GenderType gender;
	private LocalDate birthDay;
}

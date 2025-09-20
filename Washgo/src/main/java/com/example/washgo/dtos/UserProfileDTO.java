package com.example.washgo.dtos;

import com.example.washgo.model.AdminProfile;
import com.example.washgo.model.CarwashProfile;
import com.example.washgo.model.ClientProfile;

import lombok.Data;

@Data
public class UserProfileDTO {
	private ClientProfile clientProfile;
	private AdminProfile adminProfile;
	private CarwashProfile carwashProfile;
}

package com.example.washgo.service;

import com.example.washgo.model.UserAccount;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jakarta.persistence.EntityNotFoundException;

import com.example.washgo.dtos.ClientProfileDTO;
import com.example.washgo.dtos.ClientProfileUpdateDTO;
import com.example.washgo.dtos.UserProfileDTO;
import com.example.washgo.enums.GenderType;
import com.example.washgo.mapper.UserMapper;
import com.example.washgo.model.AdminProfile;
import com.example.washgo.model.CarwashProfile;
import com.example.washgo.model.ClientProfile;
import com.example.washgo.model.UserInformation;
import com.example.washgo.repository.*;
import com.example.washgo.security.JwtService;
@Service
public class UserInformationService {
	private UserInformationRepository userInformationRepository;
	private ClientProfileRepository clientProfileRepository;
	private UserAccountRepository userAccountRepository;
	private JwtService jwtService;
	
	@Autowired
	public UserInformationService(ClientProfileRepository clientProfileRepository,
								  UserInformationRepository userInformationRepository,
								  UserAccountRepository userAccountRepository,
								  JwtService jwtService) {
		this.userInformationRepository = userInformationRepository;
		this.clientProfileRepository = clientProfileRepository;
		this.userAccountRepository = userAccountRepository;
		this.jwtService = jwtService;
	}

	public ClientProfileDTO getClientProfile(Long userId) {
		ClientProfileDTO clientProfileDTO = new ClientProfileDTO();
		UserInformation userInformation = findUserById(userId);
		
		clientProfileDTO = UserMapper.toClientProfileDTO(userInformation);
		
		return clientProfileDTO;
	}
	
	public UserInformation findUserById(Long userId) {
	    return userInformationRepository.findById(userId)
	    		.orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));
	}
	public ClientProfile findClientById(Long userId) {
	    return clientProfileRepository.findById(userId)
	    		.orElseThrow(() -> new EntityNotFoundException("Client not found with id: " + userId));
	}

	public boolean updateClientProfile(ClientProfileUpdateDTO updateDTO) {
				ClientProfile clientProfile = findClientById(updateDTO.getUserId());
				UserInformation userInformation = findUserById(clientProfile.getId());
				UserAccount userAccount = userInformation.getAccount();

				if(updateDTO.getUserName()!=null) {
					userAccount = userInformation.getAccount();
					userAccount.setUsername(updateDTO.getUserName());
				}
				if(updateDTO.getBirthDay()!=null) {
					clientProfile.setBirthDay(updateDTO.getBirthDay());
				}
				if(updateDTO.getGender() !=  null) {
					clientProfile.setGender(GenderType.valueOf(updateDTO.getGender()));
				}
		ClientProfile savedClientProfile = null;
		UserAccount savedUserAccount = null;
				if(userAccount!=null) {
					 savedClientProfile = clientProfileRepository.save(clientProfile);
				}
				if(userAccount!=null) {
					savedUserAccount = userAccountRepository.save(userAccount);
				}
				if (savedClientProfile != null && savedUserAccount != null) {
					return true;	
				}
		return false;
	}
	
	   public long getUserIdFromAccesstoken(String accessToken) {
	        if (accessToken == null || accessToken.trim().isEmpty()) {
	            throw new IllegalArgumentException("Access token must not be null or empty");
	        }

	        return jwtService.getUserIdFromAccessToken(accessToken);
	    }
	
	public UserInformation getUserProfileByAccessToken(String accessToken) {
		 Long id = jwtService.getUserIdFromAccessToken(accessToken);
		
		 UserInformation userInformation = findUserById(id);
		 
		
		return userInformation;
	}
	
	public CarwashProfile getCarwashProfileByAccessToken(String accessToken) {
		UserInformation userInformation = getUserProfileByAccessToken(accessToken);
		CarwashProfile carwashProfile = userInformation.getCarwashProfile();
		
		return carwashProfile;
	}
	
	public ClientProfile getClientProfileByAccessToken(String accessToken) {
		UserInformation userInformation = getUserProfileByAccessToken(accessToken);
		ClientProfile clientProfile = userInformation.getClientProfile();
		return clientProfile;
	}
	
	public Optional<UserAccount> findByUserName(String name){
		return userAccountRepository.findByUsername(name);
	}

	
}

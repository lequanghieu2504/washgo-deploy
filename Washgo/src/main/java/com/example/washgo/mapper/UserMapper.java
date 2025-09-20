package com.example.washgo.mapper;

import com.example.washgo.dtos.*;
import com.example.washgo.model.AdminProfile;
import com.example.washgo.model.CarwashProfile;
import com.example.washgo.model.ClientProfile;
import com.example.washgo.model.UserInformation;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;


@Component
public class UserMapper {

    // --- DTO mapping methods ---
    public ClientDTO toClientDTO(UserInformation user) {
        ClientDTO dto = new ClientDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getAccount().getUsername());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole().name());
        return dto;
    }

    public AdminDTO toAdminDTO(UserInformation user) {
        AdminDTO dto = new AdminDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getAccount().getUsername());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole().name());
        return dto;
    }

    public CarwashDTO toCarwashDTO(UserInformation user) {
        CarwashDTO dto = new CarwashDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getAccount().getUsername());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole().name());

        if (user.getCarwashProfile() != null) {
            CarwashProfile profile = user.getCarwashProfile();
            dto.setCarwashName(profile.getCarwashName());
            dto.setLocation(profile.getLocation());
            dto.setDescription(profile.getDescription());
            dto.setAverageRating(profile.getAverageRating());
            dto.setRatingCount(profile.getRatingCount());
            // Map coordinates as String
            dto.setLatitude(profile.getLatitude());   // Map String
            dto.setLongitude(profile.getLongitude()); // Map String
        }
        return dto;
    }

    // --- Method to map to the primary UserReadDTO ---
    public UserReadDTO toUserReadDTO(UserInformation user) {
        if (user == null) {
            return null;
        }

        UserReadDTO dto = new UserReadDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getAccount().getUsername());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());

        switch (user.getRole()) {
            case CLIENT:
                if (user.getClientProfile() != null) {
                    dto.setClientProfile(mapToClientProfileDTO(user.getClientProfile()));
                }
                break;
            case CARWASH:
                if (user.getCarwashProfile() != null) {
                    dto.setCarwashProfile(mapToCarwashProfileDTO(user.getCarwashProfile()));
                }
                break;
            case ADMIN:
                if (user.getAdminProfile() != null) {
                    dto.setAdminProfile(mapToAdminProfileDTO(user.getAdminProfile()));
                }
                break;
        }
        return dto;
    }

    // --- Helper methods for nested profile DTOs ---

    private UserReadDTO.ClientProfileDTO mapToClientProfileDTO(ClientProfile clientProfile) {
        UserReadDTO.ClientProfileDTO dto = new UserReadDTO.ClientProfileDTO();
        return dto;
    }

    private UserReadDTO.CarwashProfileDTO mapToCarwashProfileDTO(CarwashProfile profile) {
        UserReadDTO.CarwashProfileDTO dto = new UserReadDTO.CarwashProfileDTO();
        dto.setCarwashName(profile.getCarwashName());
        dto.setLocation(profile.getLocation());
        dto.setDescription(profile.getDescription());
        // Map coordinates as String
        dto.setLatitude(profile.getLatitude());   // Map String
        dto.setLongitude(profile.getLongitude()); // Map String
        dto.setAverageRating(profile.getAverageRating());
        dto.setRatingCount(profile.getRatingCount());
        return dto;
    }

    private UserReadDTO.AdminProfileDTO mapToAdminProfileDTO(AdminProfile profile) {
        UserReadDTO.AdminProfileDTO dto = new UserReadDTO.AdminProfileDTO();
        return dto;
    }

    // --- Method to map a list of users ---
    public List<UserReadDTO> toUserReadDTOList(List<UserInformation> users) {
        if (users == null) {
            return Collections.emptyList();
        }
        return users.stream()
                .map(this::toUserReadDTO)
                .collect(Collectors.toList());
    }
    
    public static ClientProfileDTO toClientProfileDTO (UserInformation userInformation) {
    	ClientProfileDTO clientProfileDTO = new ClientProfileDTO();
    	clientProfileDTO.setId(userInformation.getId());
		clientProfileDTO.setUserName(userInformation.getAccount().getUsername());
		clientProfileDTO.setBirthDay(userInformation.getClientProfile().getBirthDay());
		clientProfileDTO.setGender(userInformation.getClientProfile().getGender());
		clientProfileDTO.setGmail(userInformation.getEmail());
		clientProfileDTO.setPhonenumber(userInformation.getPhoneNumber());
		return clientProfileDTO;
	}
}

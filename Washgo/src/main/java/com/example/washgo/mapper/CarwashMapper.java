package com.example.washgo.mapper;

import com.example.washgo.dtos.CarwashFilterListDTO;
import com.example.washgo.dtos.CarwashFilterMapDTO;
import com.example.washgo.model.CarwashProfile;

public class CarwashMapper {

    public static CarwashFilterListDTO toFilterListDTO(CarwashProfile profile) {
        if (profile == null) return null;

        CarwashFilterListDTO dto = new CarwashFilterListDTO();
        dto.setId(profile.getId());
        dto.setCarwashName(profile.getCarwashName());
        dto.setLocation(profile.getLocation());
        dto.setDescription(profile.getDescription());
        dto.setAverageRating(profile.getAverageRating());
        dto.setFrom(profile.getSchedule().getAvailableFrom());
        dto.setTo(profile.getSchedule().getAvailableTo());
        if (profile.getUser() != null) {
            dto.setPhoneNumber(profile.getUser().getPhoneNumber()); // Giả định có field này
        }
        dto.setLatitude(profile.getLatitude());
        dto.setLongitude(profile.getLongitude());
        return dto;
    }

    public static CarwashFilterMapDTO toFilterMapDTO(CarwashProfile profile) {
        if (profile == null) return null;

        CarwashFilterMapDTO dto = new CarwashFilterMapDTO();
        dto.setId(profile.getId());
        dto.setLatitude(profile.getLatitude());
        dto.setLongitude(profile.getLongitude());

        return dto;
    }
}


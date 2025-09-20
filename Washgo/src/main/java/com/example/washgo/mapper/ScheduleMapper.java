package com.example.washgo.mapper;

import com.example.washgo.dtos.ScheduleInputDTO;
import com.example.washgo.model.CarwashProfile;
import com.example.washgo.model.Schedule;
import com.example.washgo.model.UserInformation;
import com.example.washgo.service.CarwashService;
import com.example.washgo.service.UserInformationService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalTime;

@Component
public class ScheduleMapper {

    private final CarwashService carwashService;
    private final UserInformationService userInformationService;

    @Autowired
    public ScheduleMapper(CarwashService carwashService, UserInformationService userInformationService) {
        this.carwashService = carwashService;
        this.userInformationService = userInformationService;
    }

    public  Schedule toSchedule(ScheduleInputDTO scheduleInputDTO){
        Schedule schedule = new Schedule();


        
        CarwashProfile carwashProfile = userInformationService.findUserById(scheduleInputDTO.getCarwashId()).getCarwashProfile();


        schedule.setActive(scheduleInputDTO.getIsActive());
        if (scheduleInputDTO.getCapacity() < 1) {
            throw new IllegalArgumentException("capacity phải >= 1.");
        }
        schedule.setCapacity(scheduleInputDTO.getCapacity());        // Validate giờ mở/đóng
        LocalTime from = scheduleInputDTO.getAvailableFrom();
        LocalTime to   = scheduleInputDTO.getAvailableTo();
        if (from == null || to == null) {
            throw new IllegalArgumentException("availableFrom và availableTo không được null.");
        }
        if (from.isAfter(to) || from.equals(to)) {
            throw new IllegalArgumentException("availableFrom phải trước availableTo và không được bằng nhau.");
        }
        schedule.setAvailableTo(scheduleInputDTO.getAvailableTo());
        schedule.setAvailableFrom(scheduleInputDTO.getAvailableFrom());
        schedule.setCarwash(carwashProfile);
        return schedule;
    }
}

package com.example.washgo.dtos;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalTime;

@Data
public class ScheduleInputDTO {

    private Long id;

    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime availableFrom;


    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime availableTo;

    private Integer capacity;

    private Boolean isActive;
    
    //cai nay de mapper khong set trong postman
    private Long carwashId;

    //dung accestoken nen khong can nua
//    private Long carwashId;
}

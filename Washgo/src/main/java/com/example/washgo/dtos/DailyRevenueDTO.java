package com.example.washgo.dtos;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DailyRevenueDTO {
    private LocalDate date;
    private double totalRevenue;
}


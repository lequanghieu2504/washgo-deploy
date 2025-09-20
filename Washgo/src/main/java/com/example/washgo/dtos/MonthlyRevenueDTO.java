package com.example.washgo.dtos;
import lombok.*;
@Data
public class MonthlyRevenueDTO {
    private int month;
    private double totalRevenue;

    public MonthlyRevenueDTO(int month, double totalRevenue) {
        this.month = month;
        this.totalRevenue = totalRevenue;
    }

}

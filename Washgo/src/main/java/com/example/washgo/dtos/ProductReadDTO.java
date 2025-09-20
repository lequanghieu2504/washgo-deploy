package com.example.washgo.dtos;

import com.example.washgo.model.Pricing;
import lombok.Data;

import java.time.LocalTime;
@Data
public class ProductReadDTO {
    private Long id;
    private String name; // Specific name for this offering
    private String description; // Specific description
    private boolean isActive;
    private Long productMasterId; // ID of the template used
    private String productMasterName; // Name of the template used
    private Long carwashOwnerId; // ID of the car wash offering this
    private LocalTime timing;
    private Long productParent;

    private double price = -1;
    private String currency;

}

package com.example.washgo.dtos;

import lombok.Data;

@Data
public class ProductWithPricingDTO {
    private Long productId;
    private String productName;
    private String description;
    private Double price;
    private String unit;
    // constructors, getters, setters
}

// src/main/java/com/example/washgo/dtos/PricingDTO.java
package com.example.washgo.dtos;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PricingDTO {
    private Long id;
    private double price;
    private String currency;
}
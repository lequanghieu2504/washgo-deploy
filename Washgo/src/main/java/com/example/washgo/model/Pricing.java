package com.example.washgo.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class Pricing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private double price;

    private String currency;


    @OneToOne (fetch = FetchType.LAZY) // Consider making LAZY
    @JoinColumn(name = "product_id")
    // --- FIX: Add the matching name ---
    @JsonBackReference("product-pricing")
    private Product product;

    // getters and setters - Lombok @Data handles this
}
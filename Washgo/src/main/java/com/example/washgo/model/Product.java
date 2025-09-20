// src/main/java/com/example/washgo/model/Product.java
package com.example.washgo.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode; // Import these
import lombok.ToString;       // Import these

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Name might be derived from master or customizable
    private String name;

    // Description might be derived or customizable
    private String description;

    private LocalDate effectiveFrom;

    private LocalDate effectiveTo;

    private boolean isActive = true;

    // Link back to the general service type (template)
    @ManyToOne(fetch = FetchType.LAZY) // Make LAZY
    @JoinColumn(name = "product_master_id", nullable = true) // Master is mandatory
    @JsonBackReference("productmaster-products") // Matches ManagedReference in ProductMaster
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private ProductMaster productMaster;

    // --- NEW RELATIONSHIP: Link to the Car Wash offering this specific Product ---
    @ManyToOne(fetch = FetchType.LAZY) // Make LAZY
    @JoinColumn(name = "carwash_owner_id", nullable = false) // Owner is mandatory
    @JsonBackReference("carwash-products") // Matches ManagedReference in UserInformation
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private CarwashProfile carwashOwner;

    // Car wash specific pricing for this product offering
    @OneToOne(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("product-pricing") // Use distinct name
    private Pricing pricing;

    private LocalTime timeming;
    // getters and setters
    // Optional: This product can be a version/variant of another product
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_product_id")
    @JsonBackReference("product-parent") // Prevent infinite recursion
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Product parent;

    // Optional: List of children for this product (not mandatory, used for hierarchy display)
    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL)
    @JsonManagedReference("product-parent")
    private List<Product> children = new ArrayList<>();

    
}
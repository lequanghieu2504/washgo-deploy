// src/main/java/com/example/washgo/model/ProductMaster.java
package com.example.washgo.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
@Entity
public class ProductMaster {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false) // Make name unique
    private String name;

    private String description;

    private String category;

    // Relationship to specific product offerings based on this master
    @OneToMany(mappedBy = "productMaster", cascade = CascadeType.PERSIST, // Adjust cascade as needed
            fetch = FetchType.LAZY) // Products shouldn't be deleted if master is deleted
    @JsonManagedReference("productmaster-products")
    private List<Product> products = new ArrayList<>();

    // REMOVED owner field
    // private UserInformation owner;

    // getters and setters
}
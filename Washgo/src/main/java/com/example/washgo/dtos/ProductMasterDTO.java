// src/main/java/com/example/washgo/dtos/ProductMasterDTO.java
package com.example.washgo.dtos;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
// Removed List<ProductDTO> import as masters are templates now

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductMasterDTO {
    private Long id;
    private String name; // Template name
    private String description; // Template description
    private String category;
    // REMOVED ownerUserId
    // REMOVED products list (Masters are now just templates)
}
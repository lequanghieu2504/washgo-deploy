// src/main/java/com/example/washgo/mapper/ProductMasterMapper.java
package com.example.washgo.mapper;

import com.example.washgo.dtos.ProductMasterDTO;
import com.example.washgo.model.ProductMaster;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class ProductMasterMapper {

    private final ProductMapper productMapper; // Inject ProductMapper

    public ProductMasterMapper(ProductMapper productMapper) {
        this.productMapper = productMapper;
    }

    public ProductMasterDTO toProductMasterDTO(ProductMaster productMaster) {
        if (productMaster == null) return null;
        return new ProductMasterDTO(
                productMaster.getId(),
                productMaster.getName(),
                productMaster.getDescription(),
                productMaster.getCategory());
    }

    public List<ProductMasterDTO> toProductMasterDTOList(List<ProductMaster> productMasters) {
        if (productMasters == null) return Collections.emptyList();
        return productMasters.stream().map(this::toProductMasterDTO).collect(Collectors.toList());
    }
}
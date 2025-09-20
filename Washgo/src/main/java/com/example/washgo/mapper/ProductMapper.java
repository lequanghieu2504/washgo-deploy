// src/main/java/com/example/washgo/mapper/ProductMapper.java
package com.example.washgo.mapper;

import com.example.washgo.dtos.PricingDTO;
import com.example.washgo.dtos.ProductDTO;
import com.example.washgo.dtos.ProductResponseDTO;
import com.example.washgo.dtos.ProductWithPricingDTO;
import com.example.washgo.dtos.ScheduleSummaryDTO;
import com.example.washgo.dtos.subProductDTO;
import com.example.washgo.enums.BookingStatus;
import com.example.washgo.model.Pricing;
import com.example.washgo.model.Product;
import com.example.washgo.model.Schedule;
import com.example.washgo.repository.ProductRepository;
import com.example.washgo.service.ProductService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class ProductMapper {
	
	

	
    // PricingDTO and ScheduleSummaryDTO mapping methods remain the same...

    public PricingDTO toPricingDTO(Pricing pricing) {
        if (pricing == null) return null;
        return new PricingDTO(
                pricing.getId(),
                pricing.getPrice(),
                pricing.getCurrency()
        );
    }

    public List<PricingDTO> toPricingDTOList(List<Pricing> pricings) {
        if (pricings == null) return Collections.emptyList();
        return pricings.stream().map(this::toPricingDTO).collect(Collectors.toList());
    }

    // --- UPDATED Schedule Summary Mapping ---
    public ScheduleSummaryDTO toScheduleSummaryDTO(Schedule schedule) {
        if (schedule == null) return null; //
        // Calculate active bookings count here


        return new ScheduleSummaryDTO(
                schedule.getId(), //
                schedule.getAvailableFrom(), //
                schedule.getAvailableTo(), //
                schedule.getCapacity() // --- ADDED --- // (using updated model)
        );
    }

    public List<ScheduleSummaryDTO> toScheduleSummaryDTOList(List<Schedule> schedules) {
        if (schedules == null) return Collections.emptyList();
        return schedules.stream().map(this::toScheduleSummaryDTO).collect(Collectors.toList());
    }


    // --- Updated Product Mapper ---
    public ProductDTO toProductDTO(Product product) {
        // Check if product is null
        if (product == null) {
            throw new IllegalArgumentException("Product cannot be null");
        }

        // Initialize ProductDTO
        ProductDTO productDTO = new ProductDTO();

        // Set ID with null check
        if (product.getId() == null) {
            throw new IllegalArgumentException("Product ID cannot be null");
        }
        productDTO.setId(product.getId());

        // Set Name with null and empty check
        if (product.getName() == null || product.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Product name cannot be null or empty");
        }
        productDTO.setName(product.getName());

        // Set Description with null and empty check
        if (product.getDescription() == null || product.getDescription().trim().isEmpty()) {
            throw new IllegalArgumentException("Product description cannot be null or empty");
        }
        productDTO.setDescription(product.getDescription());

        // Set Active status (no null check needed for boolean, safe to set)
        productDTO.setActive(product.isActive());

        // Set ProductMaster ID with null check
        if (product.getProductMaster() == null) {
            productDTO.setProductMasterId(null);
        } else {
            if (product.getProductMaster().getId() == null) {
                throw new IllegalArgumentException("ProductMaster ID cannot be null");
            }
            productDTO.setProductMasterId(product.getProductMaster().getId());
        }

        // Set ProductMaster Name with null and empty check
        if (product.getProductMaster() == null) {
            productDTO.setProductMasterName(null);
        } else {
            if (product.getProductMaster().getName() == null || product.getProductMaster().getName().trim().isEmpty()) {
                throw new IllegalArgumentException("ProductMaster name cannot be null or empty");
            }
            productDTO.setProductMasterName(product.getProductMaster().getName());
        }

        // Set CarwashOwner ID with null check
        if (product.getCarwashOwner() == null) {
            productDTO.setCarwashOwnerId(null);
        } else {
            if (product.getCarwashOwner().getId() == null) {
                throw new IllegalArgumentException("CarwashOwner ID cannot be null");
            }
            productDTO.setCarwashOwnerId(product.getCarwashOwner().getId());
        }
        if (product.getPricing() != null) {
            productDTO.setPricing(product.getPricing());
        }

        // Set Timeming with null check
        if (product.getTimeming() == null) {
            throw new IllegalArgumentException("Product timeming cannot be null");
        }
        productDTO.setTiming(product.getTimeming());

        if(product.getParent()!=null) {
            System.out.println(product.getParent().getId());
            productDTO.setProductParent(product.getParent().getId());        	
        }

        return productDTO;
    }    

    public List<ProductDTO> toProductDTOList(List<Product> products) {
        if (products == null) return Collections.emptyList();
        return products.stream().map(this::toProductDTO).collect(Collectors.toList());
    }
    
    public static ProductWithPricingDTO toProductWithPricingDTO(Product product) {
        ProductWithPricingDTO dto = new ProductWithPricingDTO();
        dto.setProductId(product.getId());
        dto.setProductName(product.getName());
        dto.setDescription(product.getDescription());

        if (product.getPricing() != null) {
            dto.setPrice(product.getPricing().getPrice());
            dto.setUnit(product.getPricing().getCurrency());
        }

        return dto;
    }

	public subProductDTO toSubProductDTO(Product product) {
		  // Check if product is null
        if (product == null) {
            throw new IllegalArgumentException("Product cannot be null");
        }

        // Initialize ProductDTO
        subProductDTO productDTO = new subProductDTO();


        // Set Name with null and empty check
        if (product.getName() == null || product.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Product name cannot be null or empty");
        }
        productDTO.setName(product.getName());

        // Set Description with null and empty check
        if (product.getDescription() == null || product.getDescription().trim().isEmpty()) {
            throw new IllegalArgumentException("Product description cannot be null or empty");
        }
        productDTO.setDescription(product.getDescription());

        // Set Active status (no null check needed for boolean, safe to set)
        productDTO.setActive(product.isActive());


       

        // Set CarwashOwner ID with null check
        if (product.getCarwashOwner() == null) {
            productDTO.setCarwashOwnerId(null);
        } else {
            if (product.getCarwashOwner().getId() == null) {
                throw new IllegalArgumentException("CarwashOwner ID cannot be null");
            }
            productDTO.setCarwashOwnerId(product.getCarwashOwner().getId());
        }

     

        // Set Timeming with null check
        if (product.getTimeming() == null) {
            throw new IllegalArgumentException("Product timeming cannot be null");
        }
        productDTO.setTiming(product.getTimeming());

        if(product.getParent().getId() != null) {
            productDTO.setParentId(product.getParent().getId());        	
        }

        return productDTO;

	}

	public ProductResponseDTO toProductResponseDTO(Product product) {
		// Check if product is null
        if (product == null) {
            throw new IllegalArgumentException("Product cannot be null");
        }

        // Initialize ProductDTO
        ProductResponseDTO productDTO = new ProductResponseDTO();

        // Set ID with null check
        if (product.getId() == null) {
            throw new IllegalArgumentException("Product ID cannot be null");
        }
        productDTO.setId(product.getId());

        // Set Name with null and empty check
        if (product.getName() == null || product.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Product name cannot be null or empty");
        }
        productDTO.setName(product.getName());

        // Set Description with null and empty check
        if (product.getDescription() == null || product.getDescription().trim().isEmpty()) {
            throw new IllegalArgumentException("Product description cannot be null or empty");
        }
        productDTO.setDescription(product.getDescription());

        // Set Active status (no null check needed for boolean, safe to set)
        productDTO.setActive(product.isActive());

        // Set ProductMaster ID with null check
        if (product.getProductMaster() == null) {
            productDTO.setProductMasterId(null);
        } else {
            if (product.getProductMaster().getId() == null) {
                throw new IllegalArgumentException("ProductMaster ID cannot be null");
            }
            productDTO.setProductMasterId(product.getProductMaster().getId());
        }

        // Set ProductMaster Name with null and empty check
        if (product.getProductMaster() == null) {
            productDTO.setProductMasterName(null);
        } else {
            if (product.getProductMaster().getName() == null || product.getProductMaster().getName().trim().isEmpty()) {
                throw new IllegalArgumentException("ProductMaster name cannot be null or empty");
            }
            productDTO.setProductMasterName(product.getProductMaster().getName());
        }

        // Set CarwashOwner ID with null check
        if (product.getCarwashOwner() == null) {
            productDTO.setCarwashOwnerId(null);
        } else {
            if (product.getCarwashOwner().getId() == null) {
                throw new IllegalArgumentException("CarwashOwner ID cannot be null");
            }
            productDTO.setCarwashOwnerId(product.getCarwashOwner().getId());
        }
        if (product.getPricing() != null) {
            productDTO.setPricing(product.getPricing());
        }

        // Set Timeming with null check
        if (product.getTimeming() == null) {
            throw new IllegalArgumentException("Product timeming cannot be null");
        }
        productDTO.setTiming(product.getTimeming());

        if(product.getParent()!=null) {
            System.out.println(product.getParent().getId());
            productDTO.setProductParent(product.getParent().getId());        	
        }

        return productDTO;
	}


    

}
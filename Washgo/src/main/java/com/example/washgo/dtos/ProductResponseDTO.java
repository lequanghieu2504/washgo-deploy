package com.example.washgo.dtos;

import java.time.LocalTime;

import com.example.washgo.model.Pricing;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponseDTO {

		private Long id;
	    private String name; // Specific name for this offering
	    private String description; // Specific description
	    private boolean isActive;
	    private Long productMasterId; // ID of the template used
	    private String productMasterName; // Name of the template used
	    private Long carwashOwnerId; // ID of the car wash offering this
	    private LocalTime timing;
		private Long productParent;

		private Pricing pricing;

}

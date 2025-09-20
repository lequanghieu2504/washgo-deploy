package com.example.washgo.dtos;

import java.time.LocalTime;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
public class CarwashProfileFilterCriticcal {
	  private String carwashName;     
	    private String location;        
	    private Double minRating;       
	    private Double maxRating;       
	    private Integer minRatingCount; 

	    private LocalTime desiredTime;
	    
	    @JsonProperty("Latitude")
	    private String latitude;

	    @JsonProperty("Longitude")
	    private String longitude;

	    private long productMasterId = -1;

}

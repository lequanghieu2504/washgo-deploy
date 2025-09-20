package com.example.washgo.dtos;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
public class CouponDTO {
    private String name;
  
    @JsonProperty("clientId")
    private Long client_id;
    @JsonProperty("carwashId")
    private Long carwash_id;
    
    private String discountType;
    private long discount_value;
    
    @JsonProperty("startedDay")
    private LocalDateTime startedDay;
    
    @JsonProperty("EndDate")
    private LocalDateTime EndDate;
    
  
}

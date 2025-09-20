package com.example.washgo.model;
import com.example.washgo.enums.DiscountType;
import lombok.*;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
@Entity
@Data
public class Coupon {

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	private String name;
	//to find who is make that
	@ManyToOne
	@JoinColumn(name = "carwash_id")
	private CarwashProfile carwas;
	
	//them vao discount_type
	@Enumerated(EnumType.STRING)
	@Column(name = "discount_type")
	private DiscountType discountType;

	private long discount_value;
	
	private boolean isActive;
	
	private LocalDateTime startedDay;
 	 
	private LocalDateTime EndDate;
	
	private Long Client_id;
	
	
}

package com.example.washgo.model;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import lombok.Data;
@Data
@Entity
public class VerificationToken {
		@Id
	    @GeneratedValue(strategy = GenerationType.IDENTITY)
	    private Long id;

	    private String token;

	    String userDataJson;
	    
	    private LocalDateTime expiryDate;

	    private boolean used = false;

	    
	}


package com.example.washgo.model;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;
import com.example.washgo.enums.OTPType;
@Data
@Entity
public class VerificationOTP {
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String OTP;

    String userDataJson;
    
    private LocalDateTime expiryDate;

    private boolean used = false;

    @Enumerated(EnumType.STRING)
    private OTPType type;
    
    private String email;
}

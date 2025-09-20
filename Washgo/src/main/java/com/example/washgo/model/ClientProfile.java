package com.example.washgo.model;

import java.time.LocalDate;
import java.util.List;

import com.example.washgo.enums.GenderType;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "client_profile")
@Data
public class ClientProfile {

    @Id
    private Long id;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    @JsonBackReference("client-profile")
    private UserInformation user;
    
    @OneToMany
    @JoinColumn(name = "client_id")
    List<Coupon> listCoupons;
    // Client-specific data (optional for now)

    @OneToMany
    @JoinColumn(name = "client_id") // Stamp cũng có cột client_id để link tới Client
    private List<Stamp> listStamps;
    
	private GenderType gender;
	private LocalDate birthDay;
    
}

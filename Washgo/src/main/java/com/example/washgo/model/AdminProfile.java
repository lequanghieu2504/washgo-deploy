package com.example.washgo.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "admin_profile")
@Data
public class AdminProfile {

    @Id
    private Long id;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    @JsonBackReference("admin-profile")
    private UserInformation user;

    // Admin-specific data (optional)
}

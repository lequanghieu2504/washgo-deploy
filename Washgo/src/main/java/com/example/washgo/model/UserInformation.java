package com.example.washgo.model;

import com.example.washgo.enums.UserRole;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.nimbusds.oauth2.sdk.Role;
import com.example.washgo.media.MediaEntity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "user_information")
public class UserInformation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String phoneNumber;
    
    @Column(updatable = false, nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // --- One-to-One với UserAccount ---
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY, optional = true)
    private UserAccount account;

    // --- Một người dùng có thể là Client ---
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference("client-profile")
    private ClientProfile clientProfile;

    // --- hoặc là Carwash Owner ---
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference("carwash-profile")
    private CarwashProfile carwashProfile;

    // --- hoặc là Admin ---
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference("admin-profile")
    private AdminProfile adminProfile;

    // --- Nếu là chủ Carwash thì có thể sở hữu các Product ---
    @Column(unique = true, nullable = true)
    private String email;
    // --- Callbacks ---
    @PrePersist
    protected void onCreate() {
        createdAt = updatedAt = LocalDateTime.now();
    }

    @PreUpdate 
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "avatar_media_id", unique = true)
    private MediaEntity avatar;
}

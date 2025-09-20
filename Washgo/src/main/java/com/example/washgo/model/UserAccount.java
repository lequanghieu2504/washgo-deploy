package com.example.washgo.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "user_account")
public class UserAccount {

    @Id
    private Long id; // Dùng chung ID với UserInformation

    @OneToOne
    @MapsId // Gắn ID của UserAccount chính là ID của UserInformation
    @JoinColumn(name = "id")
    private UserInformation user;

    @Column(unique = true, nullable = false)
    private String username;

  

    @Column(nullable = false)
    private String passwordHash;



    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(nullable = true)
    private String googleId;
    
    @PrePersist
    protected void onCreate() {
        createdAt = updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

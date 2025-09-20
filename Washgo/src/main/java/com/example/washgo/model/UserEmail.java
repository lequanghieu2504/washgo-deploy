package com.example.washgo.model;

import com.example.washgo.enums.emailStatus;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import lombok.Data;

@Entity
@Data
public class UserEmail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userMail;

    @Enumerated(EnumType.STRING)
    private emailStatus emailStatus;

    @OneToOne
    @JoinColumn(name = "id", nullable = false) // ánh xạ đến khóa chính "id" của User
    private UserInformation user;
}


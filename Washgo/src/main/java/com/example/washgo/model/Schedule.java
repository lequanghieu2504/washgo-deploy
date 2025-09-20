package com.example.washgo.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalTime;

@Entity
@Table(name = "schedule")
@Data
public class Schedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalTime availableFrom;
    private LocalTime availableTo;

    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT false")
    private boolean isActive;

    @Column(nullable = false, columnDefinition = "INT DEFAULT 1")
    private int capacity = 1;

    // --- Mỗi Schedule gắn đúng với một Carwash ---
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "carwash_id", nullable = false)
    @JsonBackReference  // để ngăn infinite recursion khi serialize JSON
    private CarwashProfile carwash;
}

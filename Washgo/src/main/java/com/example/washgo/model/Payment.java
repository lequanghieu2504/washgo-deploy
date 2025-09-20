package com.example.washgo.model;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import lombok.*;
import java.time.LocalDateTime;
@Data
@Entity
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Double price;

    @Column(nullable = false)
    private String status = "PENDING"; // COMPLETED, PENDING, FAILED, etc.

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = true)
    private LocalDateTime updatedAt;

    @OneToOne
    @JoinColumn(name = "coupon_id", unique = true) // Đảm bảo mỗi Payment chỉ liên kết với một Coupon
    private Coupon coupon;

    @OneToOne
    @JoinColumn(name = "booking_id", unique = true) // Đảm bảo mỗi Payment chỉ liên kết với một Booking
    private Booking booking;

    @OneToOne
    @JoinColumn(name = "carwash_id", unique = false) // Đảm bảo mỗi Payment chỉ liên kết với một Booking
    private CarwashProfile carwashProfile;
}
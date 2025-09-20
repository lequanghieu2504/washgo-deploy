package com.example.washgo.model;

import com.example.washgo.enums.BookingStatus;
import com.fasterxml.jackson.annotation.JsonBackReference;

import io.micrometer.common.lang.Nullable;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import com.example.washgo.enums.BookingStatus;

@Data
@Entity
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;




    private String notes;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    @ManyToMany
    @JoinTable(
        name = "booking_product",
        joinColumns = @JoinColumn(name = "booking_id"),
        inverseJoinColumns = @JoinColumn(name = "product_id")
    )
    private List<Product> products;


    // Quan hệ Many-to-One với User
    @ManyToOne
    @JoinColumn(name = "user_information_id")
    private UserInformation userInformation;

    @ManyToOne
    @JoinColumn(name = "carwash_id") // Tên cột khóa ngoại trong bảng Booking
    private CarwashProfile carwash;



    // Quan hệ One-to-Many với Feedback
    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Feedback> feedbacks;  // Một booking có thể có nhiều feedback
    
    @OneToOne
    @JoinColumn(name = "coupon_id", nullable = true)
    private Coupon selectedCoupon; // Người dùng chọn trước (có thể null)	
    
    @OneToOne(mappedBy = "booking", cascade = CascadeType.ALL)
    private Payment payment;
    
    @Nullable
    private Double totalPrice;

    @Nullable
    private String currency;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private BookingStatus status;
    
}

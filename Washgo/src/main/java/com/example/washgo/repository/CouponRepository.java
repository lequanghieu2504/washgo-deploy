package com.example.washgo.repository;

import com.example.washgo.model.Coupon;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Long> {

    // Tìm tất cả coupon theo carwashId
    List<Coupon> findAllByCarwas_Id(Long carwashId);
}



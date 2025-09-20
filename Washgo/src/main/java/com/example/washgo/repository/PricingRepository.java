package com.example.washgo.repository;

import com.example.washgo.model.Pricing;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PricingRepository extends JpaRepository<Pricing, Long> {
	
	Optional<Pricing> findByProductId(Long productId);

	
}
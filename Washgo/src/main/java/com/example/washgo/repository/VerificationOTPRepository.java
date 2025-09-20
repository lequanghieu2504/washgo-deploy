package com.example.washgo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.washgo.model.VerificationOTP;
import com.example.washgo.model.VerificationToken;
@Repository
public interface VerificationOTPRepository extends JpaRepository<VerificationOTP, Long> {
	 VerificationOTP findByOTP(String token);

	 boolean existsByEmail(String email);

	long deleteByEmail(String email);
	 


}
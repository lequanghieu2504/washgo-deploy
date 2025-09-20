package com.example.washgo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.washgo.model.VerificationToken;
@Repository
public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Long> {
	 VerificationToken findByToken(String token);
}
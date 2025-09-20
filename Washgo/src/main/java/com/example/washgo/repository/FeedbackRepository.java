// src/main/java/com/example/washgo/repository/FeedbackRepository.java
package com.example.washgo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.washgo.model.Feedback;

import java.util.List; // Import List
import java.util.Optional; // Import Optional

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
	@Query("SELECT AVG(f.rating) FROM Feedback f WHERE f.carwash.id = :carwashId")
	Double getAverageRatingByCarwashId(@Param("carwashId") Long carwashId);

	@Query("SELECT COUNT(f) FROM Feedback f WHERE f.carwash.id = :carwashId")
	Integer getCountByCarwashId(@Param("carwashId") Long carwashId);

	// --- NEW METHODS ---
	List<Feedback> findByCarwashId(Long carwashId);

	List<Feedback> findByClientId(Long clientId);

	// Check if feedback already exists for a booking (optional but good practice)
	Optional<Feedback> findByBookingId(Long bookingId);
	// --- END NEW METHODS ---
}
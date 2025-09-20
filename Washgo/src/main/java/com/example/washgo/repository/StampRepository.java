package com.example.washgo.repository;

import com.example.washgo.model.Stamp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StampRepository extends JpaRepository<Stamp, Long> {
    @Query("SELECT s FROM Stamp s WHERE s.clientProfile.id = :clientId AND s.carwash_id = :carwashId")
    Optional<Stamp> findByClientProfileIdAndCarwash_id(@Param("clientId") Long clientProfileId, @Param("carwashId") Long carwash_id);}


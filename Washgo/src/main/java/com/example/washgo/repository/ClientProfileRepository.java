package com.example.washgo.repository;

import com.example.washgo.model.ClientProfile;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ClientProfileRepository extends JpaRepository<ClientProfile, Long> {
    Optional<ClientProfile> findById(Long id); // id = user_id

    @Query("SELECT COUNT(cp) FROM ClientProfile cp")
    long countClients();
}

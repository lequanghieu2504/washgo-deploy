package com.example.washgo.repository;
import com.example.washgo.model.RefreshToken;
import com.example.washgo.model.UserInformation;

import jakarta.transaction.Transactional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);
    void deleteByUser(UserInformation user);
    @Transactional
    void deleteByToken(String token);
}

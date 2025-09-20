package com.example.washgo.service;

import com.example.washgo.model.RefreshToken;
import com.example.washgo.model.UserAccount;
import com.example.washgo.model.UserInformation;
import com.example.washgo.repository.RefreshTokenRepository;

import jakarta.transaction.Transactional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class RefreshTokenService {

    @Value("${jwt.refresh.expiration}")
    private Long refreshTokenDurationMs;

    private final RefreshTokenRepository refreshTokenRepository;

    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
    }

    public RefreshToken createRefreshToken(UserAccount user) {
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setExpiryDate(Instant.now().plusMillis(refreshTokenDurationMs));
        refreshToken.setToken(UUID.randomUUID().toString());
        return refreshTokenRepository.save(refreshToken);
    }

    public Optional<RefreshToken> verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(token);
            throw new RuntimeException("Refresh token expired. Please login again.");
        }
        return Optional.of(token);
    }

    public Optional<RefreshToken> findByToken(String token) {
        System.out.println("token cua ban la: "+token);
        return refreshTokenRepository.findByToken(token);
    }
    
    public void deleteByToken(String token) {
        refreshTokenRepository.deleteByToken(token);
    }

}

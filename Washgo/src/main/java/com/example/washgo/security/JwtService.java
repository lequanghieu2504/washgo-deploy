package com.example.washgo.security;

import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
public class JwtService {

    private final JwtEncoder encoder;
    private final JwtDecoder decoder;

    public JwtService(JwtEncoder encoder, JwtDecoder decoder) {
        this.encoder = encoder;
        this.decoder = decoder;
    }

    /**
     * Generates a JWT token including username, role, and userId claims.
     *
     * @param username The username (subject).
     * @param role The user's role.
     * @param userId The user's ID.
     * @return The generated JWT token string.
     */
    public String generateToken(String username, String role, Long userId) { // Added userId parameter
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .subject(username)
                .issuedAt(now)
                .expiresAt(now.plus(30, ChronoUnit.MINUTES)) // Consider making duration configurable
                .claim("role", role)
                .claim("userId", userId) // Added userId claim
                .build();

        // Use MacAlgorithm.HS256 for header
        JwsHeader jwsHeader = JwsHeader.with(MacAlgorithm.HS256).build();

        return encoder.encode(
                JwtEncoderParameters.from(jwsHeader, claims)
        ).getTokenValue();
    }

    public Jwt decodeToken(String token) {
        return decoder.decode(token);
    }

    public boolean isTokenValid(String token) {
        try {
            decoder.decode(token);
            return true;
        } catch (JwtException e) {
            // Log the exception if needed: log.warn("JWT validation failed: {}", e.getMessage());
            return false;
        }
    }

    public long getUserIdFromAccessToken(String accessToken) {
        if (!isTokenValid(accessToken)) {
            throw new IllegalArgumentException("Access token is invalid or expired.");
        }

        Jwt jwt = decodeToken(accessToken);
        Long userId = jwt.getClaim("userId");
        
        if (userId == null) {
            throw new IllegalStateException("userId claim is missing in the token.");
        }

        return userId;
    }

}
package com.example.washgo.security;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.KeyUse;
import com.nimbusds.jose.jwk.OctetSequenceKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.UUID;
@Configuration
public class JwtConfig {

    @Value("${jwt.current-secret}") // active
    private String currentSecret;

    @Value("${jwt.previous-secrets:}") // optional, comma-separated
    private String previousSecrets;

    @Bean
    public List<SecretKey> secretKeys() {
        List<SecretKey> keys = new ArrayList<>();
        if (previousSecrets != null && !previousSecrets.isBlank()) {
            for (String s : previousSecrets.split(",")) {
                keys.add(secretFromBase64(s.trim()));
            }
        }
        keys.add(secretFromBase64(currentSecret)); // latest key last
        return keys;
    }

    private SecretKey secretFromBase64(String secret) {
        byte[] keyBytes = Base64.getDecoder().decode(secret);
        if (keyBytes.length != 32) throw new IllegalArgumentException("Each secret must be 32 bytes");
        return new SecretKeySpec(keyBytes, "HmacSHA256");
    }

    @Bean
    public JwtEncoder jwtEncoder() {
        SecretKey latest = secretFromBase64(currentSecret);
        OctetSequenceKey jwk = new OctetSequenceKey.Builder(latest.getEncoded())
                .keyUse(KeyUse.SIGNATURE)
                .algorithm(JWSAlgorithm.HS256)
                .build();
        return new NimbusJwtEncoder(new ImmutableJWKSet<>(new JWKSet(jwk)));
    }

    @Bean
    public JwtDecoder jwtDecoder(List<SecretKey> keys) {
        return token -> {
            Jwt lastException = null;
            for (SecretKey key : keys) {
                try {
                    return NimbusJwtDecoder.withSecretKey(key).build().decode(token);
                } catch (JwtException e) {
                    lastException = null; // ignore
                }
            }
            throw new JwtException("Token signature cannot be verified by any known key");
        };
    }


}

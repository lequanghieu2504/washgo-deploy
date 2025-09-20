package com.example.washgo.security;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import java.util.Collection;
import java.util.List;

public class JwtToAuthoritiesConverter implements Converter<Jwt, Collection<GrantedAuthority>> {

    @Override
    public Collection<GrantedAuthority> convert(Jwt jwt) {
        // Read the role claim from JWT
        String role = jwt.getClaim("role");
        if (role == null) {
            return List.of();
        }
        // Spring expects ROLE_ prefix
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()));
    }
}

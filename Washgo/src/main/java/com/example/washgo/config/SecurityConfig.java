//package com.example.washgo.config;
//
//import com.example.washgo.security.JwtAuthenticationFilter;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.security.config.annotation.web.builders.HttpSecurity;
//import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
//import org.springframework.security.core.authority.SimpleGrantedAuthority;
//import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
//import org.springframework.security.web.SecurityFilterChain;
//import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
//
//import java.util.List;
//
//import static org.springframework.security.config.Customizer.withDefaults;
//
//@Configuration
//@EnableWebSecurity
//public class SecurityConfig {
//
//    @Bean
//    public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtAuthenticationFilter jwtAuthenticationFilter) throws Exception {
//        http
//                .csrf(csrf -> csrf.disable())
//                .authorizeHttpRequests(auth -> auth
//                        .requestMatchers("/auth/**", "/register/**").permitAll()
//                        .anyRequest().authenticated()
//                )
//                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
//
//        return http.build();
//    }
//
//
//    @Bean
//    public JwtAuthenticationConverter jwtAuthenticationConverter() {
//        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
//        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
//            String role = jwt.getClaim("role");
//            return List.of(new SimpleGrantedAuthority(role));
//        });
//        return converter;
//    }
//
//
//    @Bean
//    public PasswordEncoder passwordEncoder() {
//        return new BCryptPasswordEncoder();
//    }
//}
package com.example.washgo.config;

import com.example.washgo.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

// Import if needed, or use HttpSecurity lambda directly
// import static org.springframework.security.config.Customizer.withDefaults;


@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtAuthenticationFilter jwtAuthenticationFilter) throws Exception {
        http
                // Apply CORS configuration globally
                .cors(cors -> cors.configurationSource(corsConfigurationSource())) // ADD THIS LINE FOR CORS
                // Disable CSRF (common for stateless APIs like JWT)
                .csrf(csrf -> csrf.disable())
                // Configure authorization rules
                .authorizeHttpRequests(auth -> auth
                                .requestMatchers("/api/product-master/getAll").permitAll()
                                .requestMatchers("/auth/**", "/register/**").permitAll()
                                .requestMatchers("/ws/**").permitAll() // Keep this
                                .requestMatchers("/api/chat/**").permitAll() // Keep this
                                .requestMatchers("/api/payment/stripe-webhook").permitAll()
                                .requestMatchers("/api/chat/**").permitAll()
                                .requestMatchers("/api/feedbacks/**").permitAll()// Keep this
                                .requestMatchers("/api/stamps/**").permitAll()// Keep this
                                .requestMatchers("/mail/**").permitAll()
                                .requestMatchers("/api/carwashes/**").permitAll()
                                .requestMatchers("/api/products/getById/**").permitAll()
                                .requestMatchers("/api/schedules/getAll").permitAll()
                                .requestMatchers("/api/bookings/**").permitAll()
                                .requestMatchers("/auth/logout").permitAll()
                                .requestMatchers("/user/reset-password").permitAll()
                                .requestMatchers("/api/products/**").permitAll()
                                .requestMatchers("/api/filter/**").permitAll()
                                .requestMatchers("/api/user/reset-password").permitAll()
                                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                                .requestMatchers("/api/media/**").permitAll()
                                .requestMatchers(HttpMethod.GET, "/uploads/**").permitAll()
                                .requestMatchers(HttpMethod.POST, "/api/feedback/*/media").permitAll()
                                .requestMatchers(HttpMethod.GET,  "/api/feedback/*/media").permitAll()


                        .anyRequest().authenticated() // <-- TEMPORARILY COMMENT THIS OUT
                )
                // Add the custom JWT filter before the standard username/password filter
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                // Optional: Configure session management if needed (e.g., STATELESS for JWT)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        return http.build();
    }

    /**
     * Configures CORS to allow requests from any origin, with any method and headers.
     * WARNING: Insecure for production. Restrict origins, methods, and headers appropriately.
     * @return CorsConfigurationSource
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOriginPatterns(List.of("*")); // 🔄 Better than setAllowedOrigins("*")
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true); // 🔥 Important for SockJS
        configuration.setExposedHeaders(List.of("Authorization", "Content-Type")); // Optional but nice
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }


    // This bean configures how roles are extracted from the JWT.
    // Ensure the claim name ("role") matches what's in your JwtService.generateToken()
    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            String role = jwt.getClaim("role");
            // Spring Security expects authorities to start with "ROLE_"
            // Make sure your UserRole enum names (CLIENT, CARWASH, ADMIN) are used correctly.
            if (role == null) {
                return List.of(); // Return empty list if role claim is missing
            }
            return List.of(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()));
        });
        return converter;
    }


    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}

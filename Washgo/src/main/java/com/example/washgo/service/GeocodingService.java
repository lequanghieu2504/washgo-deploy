package com.example.washgo.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.Duration;

@Service
public class GeocodingService {

    private static final Logger logger = LoggerFactory.getLogger(GeocodingService.class);
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper; // Jackson mapper

    // --- IMPORTANT: Change this to YOUR application's unique user agent ---
    // See: https://operations.osmfoundation.org/policies/nominatim/
    private static final String NOMINATIM_USER_AGENT = "WashGoApp/1.0 (contact@example.com)"; // REPLACE THIS

    public GeocodingService(RestTemplateBuilder restTemplateBuilder, ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.restTemplate = restTemplateBuilder
                .setConnectTimeout(Duration.ofSeconds(5)) // Set connection timeout
                .setReadTimeout(Duration.ofSeconds(10))   // Set read timeout
                .build();
    }

    /**
     * Represents geographic coordinates.
     */
    public static class Coordinates {
        public final double latitude;
        public final double longitude;

        public Coordinates(double latitude, double longitude) {
            this.latitude = latitude;
            this.longitude = longitude;
        }
    }

    /**
     * Geocodes an address string using OpenStreetMap Nominatim.
     *
     * @param address The address string to geocode.
     * @return A Coordinates object if successful, otherwise null.
     */
    public Coordinates getCoordinates(String address) {
        if (address == null || address.isBlank()) {
            logger.warn("Geocoding skipped: address is blank.");
            return null;
        }

        String url = UriComponentsBuilder
                .fromHttpUrl("https://nominatim.openstreetmap.org/search")
                .queryParam("q", address)
                .queryParam("format", "json")
                .queryParam("limit", 1) // We only need the top result
                .queryParam("addressdetails", 0) // Don't need detailed address breakdown
                .toUriString();

        HttpHeaders headers = new HttpHeaders();
        // --- CRUCIAL: Set the User-Agent header as required by Nominatim ---
        headers.set("User-Agent", NOMINATIM_USER_AGENT);
        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            logger.info("Attempting to geocode address: '{}'", address);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                if (root.isArray() && !root.isEmpty()) {
                    JsonNode firstResult = root.get(0);
                    if (firstResult.has("lat") && firstResult.has("lon")) {
                        double lat = firstResult.get("lat").asDouble();
                        double lon = firstResult.get("lon").asDouble();
                        logger.info("Geocoding successful for '{}': Lat={}, Lon={}", address, lat, lon);
                        return new Coordinates(lat, lon);
                    } else {
                        logger.warn("Geocoding result for '{}' lacks lat/lon fields.", address);
                    }
                } else {
                    logger.warn("Geocoding returned no results for address: '{}'", address);
                }
            } else {
                logger.error("Geocoding failed for address '{}'. Status: {}, Body: {}",
                        address, response.getStatusCode(), response.getBody());
            }

        } catch (HttpClientErrorException e) {
            logger.error("Geocoding HTTP error for address '{}': {} - {}", address, e.getStatusCode(), e.getResponseBodyAsString(), e);
        } catch (RestClientException e) {
            logger.error("Geocoding connection/request error for address '{}': {}", address, e.getMessage(), e);
        } catch (Exception e) { // Catch broader exceptions like JSON parsing errors
            logger.error("Unexpected error during geocoding for address '{}': {}", address, e.getMessage(), e);
        }

        return null; // Return null if geocoding fails for any reason
    }
}
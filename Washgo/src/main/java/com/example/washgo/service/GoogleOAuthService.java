package com.example.washgo.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.HashMap;
import java.util.Map;

@Service
public class GoogleOAuthService {

    @Value("${google.client-id}")
    private String clientId;

    @Value("${google.client-secret}")
    private String clientSecret;

    @Value("${google.redirect-uri}")
    private String redirectUri;

    @Value("${google.token-uri}")
    private String tokenUri;

    @Value("${google.userinfo-uri}")
    private String userinfoUri;
    
    @Value("${google.refreshToken}")
    private String refreshToken;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String getGoogleLoginUrl() {
        return UriComponentsBuilder
                .fromUriString("https://accounts.google.com/o/oauth2/v2/auth")
                .queryParam("client_id", clientId)
                .queryParam("redirect_uri", redirectUri)
                .queryParam("response_type", "code")
                .queryParam("scope", "openid email profile")
                .queryParam("access_type", "offline")
                .build()
                .toUriString();
    }

    public JsonNode getUserInfo(String code) throws Exception {
        // Step 1: Get Access Token
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        Map<String, String> params = new HashMap<>();
        params.put("code", code);
        params.put("client_id", clientId);
        params.put("client_secret", clientSecret);
        params.put("redirect_uri", redirectUri);
        params.put("grant_type", "authorization_code");

        String tokenResponse = restTemplate.postForObject(tokenUri, new HttpEntity<>(buildBody(params), headers), String.class);
        JsonNode tokenJson = objectMapper.readTree(tokenResponse);
        String accessToken = tokenJson.get("access_token").asText();

        // Step 2: Get User Info
        HttpHeaders userHeaders = new HttpHeaders();
        userHeaders.setBearerAuth(accessToken);

        HttpEntity<Void> entity = new HttpEntity<>(userHeaders);
        ResponseEntity<String> userInfoResponse = restTemplate.exchange(userinfoUri, HttpMethod.GET, entity, String.class);

        return objectMapper.readTree(userInfoResponse.getBody());
    }

    private String buildBody(Map<String, String> params) {
        StringBuilder builder = new StringBuilder();
        params.forEach((key, value) -> builder.append(key).append("=").append(value).append("&"));
        return builder.substring(0, builder.length() - 1);
    }
    public String getAccessToken() throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        Map<String, String> params = new HashMap<>();
        params.put("client_id", clientId);
        params.put("client_secret", clientSecret);
        params.put("refresh_token", refreshToken);
        params.put("grant_type", "refresh_token");

        String tokenResponse = restTemplate.postForObject(tokenUri, new HttpEntity<>(buildBody(params), headers), String.class);
        JsonNode tokenJson = objectMapper.readTree(tokenResponse);
        return tokenJson.get("access_token").asText();
    }
    public JsonNode getTokenResponse(String code) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        Map<String, String> params = new HashMap<>();
        params.put("code", code);
        params.put("client_id", clientId);
        params.put("client_secret", clientSecret);
        params.put("redirect_uri", redirectUri);
        params.put("grant_type", "authorization_code");

        String tokenResponse = restTemplate.postForObject(tokenUri, new HttpEntity<>(buildBody(params), headers), String.class);
        return objectMapper.readTree(tokenResponse);
    }

}

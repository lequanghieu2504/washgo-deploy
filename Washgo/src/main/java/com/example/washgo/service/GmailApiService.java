package com.example.washgo.service;

import java.nio.charset.StandardCharsets;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Base64;
public class GmailApiService {
	public void sendEmail(String accessToken, String toEmail, String subject, String bodyText) throws Exception {
        String mimeMessage = "From: me\r\n" +
                "To: " + toEmail + "\r\n" +
                "Subject: " + subject + "\r\n\r\n" +
                bodyText;

        String encodedEmail = Base64.getUrlEncoder().encodeToString(mimeMessage.getBytes(StandardCharsets.UTF_8));

        String jsonPayload = "{\"raw\":\"" + encodedEmail + "\"}";

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://gmail.googleapis.com/gmail/v1/users/me/messages/send"))
                .header("Authorization", "Bearer " + accessToken)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                .build();

        HttpClient client = HttpClient.newHttpClient();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new RuntimeException("Failed to send email: " + response.body());
        }
    }
}

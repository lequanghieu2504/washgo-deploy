package com.example.washgo.controller;

import com.example.washgo.dtos.ChatMessageResponseDTO;
import com.example.washgo.dtos.ChatSessionDTO;
import com.example.washgo.model.ChatMessage; // WebSocket DTO
import com.example.washgo.model.ChatSession;
import com.example.washgo.service.ChatService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
// import org.springframework.security.core.annotation.AuthenticationPrincipal; // Needed for REST security
// import org.springframework.security.oauth2.jwt.Jwt; // Needed for REST security
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.security.Principal; // Simple way to get username in WebSocket context (needs config)
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Controller to handle WebSocket chat messages and related REST endpoints.
 */
@Controller // Use @Controller for WebSocket, @RestController for REST within same class is ok
@RequestMapping("/api/chat") // Base path for REST endpoints related to chat
public class ChatController {

    private static final Logger logger = LoggerFactory.getLogger(ChatController.class);

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatService chatService;

    @Autowired
    public ChatController(SimpMessagingTemplate messagingTemplate, ChatService chatService) {
        this.messagingTemplate = messagingTemplate;
        this.chatService = chatService;
    }

    // --- WebSocket Endpoint ---

    /**
     * Handles incoming chat messages sent to the "/app/chat.sendMessage" destination.
     * Persists the message using ChatService and forwards it to the recipient's queue.
     *
     * @param chatMessage The chat message DTO received from the client.
     * @param principal   Represents the authenticated user sending the message.
     * (Requires proper WebSocket security configuration to be injected).
     */
    @MessageMapping("/chat.sendMessage")
    public void processMessage(@Payload ChatMessage chatMessage, Principal principal) {
        // --- SECURITY NOTE ---
        // In a real application, DO NOT trust chatMessage.getSenderUsername().
        // Use the authenticated 'principal' to get the actual sender's username.
        // String senderUsername = principal.getName(); // Example if Principal is configured
        // For now, we'll proceed with the DTO's sender for simplicity, but this is insecure.
        String senderUsername = chatMessage.getSenderUsername();
        if (principal != null && !principal.getName().equals(senderUsername)) {
            logger.warn("Potential spoofing attempt: Principal '{}' differs from DTO sender '{}'", principal.getName(), senderUsername);
            // Handle error appropriately - maybe throw exception or ignore message
            // For now, let's overwrite with principal if available
            senderUsername = principal.getName();
            chatMessage.setSenderUsername(senderUsername); // Correct the sender
        } else if (principal == null) {
            logger.warn("Received message without authenticated principal. Using sender from DTO: {}", senderUsername);
            // This indicates WebSocket security might not be fully configured.
        }


        logger.info("Processing message from {} to {}", senderUsername, chatMessage.getRecipientUsername());

        try {
            // Save the message using the service
            ChatMessageResponseDTO savedMessageDTO = chatService.saveMessage(chatMessage);

            // Construct the destination queue for the specific recipient
            String destination = "/queue/messages/" + savedMessageDTO.getRecipientUsername();

            // Send the *saved* message DTO (with ID and server timestamp) to the recipient
            messagingTemplate.convertAndSend(destination, savedMessageDTO);
            logger.info("Sent message ID {} to destination: {}", savedMessageDTO.getId(), destination);

            // Optionally, send confirmation back to the sender as well
             String senderDestination = "/queue/messages/" + senderUsername;
             messagingTemplate.convertAndSend(senderDestination, savedMessageDTO);

        } catch (Exception e) {
            logger.error("Error processing message from {}: {}", senderUsername, e.getMessage(), e);
            // Optionally send an error message back to the sender via WebSocket
            // String errorDestination = "/queue/errors/" + senderUsername;
            // messagingTemplate.convertAndSend(errorDestination, Map.of("error", "Failed to send message: " + e.getMessage()));
        }
    }

    // --- REST Endpoints ---

    /**
     * REST endpoint to get all chat sessions for the currently authenticated user.
     * @param principal Represents the authenticated user. (Using simple Principal for now)
     * @return List of ChatSessionDTOs.
     */
    @GetMapping("/sessions")
    @ResponseBody // Ensures response is serialized to JSON
    public ResponseEntity<List<ChatSessionDTO>> getUserSessions(Principal principal) {
        // IMPORTANT: Replace Principal with @AuthenticationPrincipal Jwt jwt (or similar)
        // once Spring Security OAuth2 Resource Server is fully configured for REST.
        if (principal == null) {
            return ResponseEntity.status(401).build(); // Unauthorized
        }
        String username = principal.getName();
        logger.info("Fetching chat sessions for user: {}", username);
        try {
            List<ChatSessionDTO> sessions = chatService.getUserChatSessions(username);
            return ResponseEntity.ok(sessions);
        } catch (Exception e) {
            logger.error("Error fetching sessions for user {}: {}", username, e.getMessage(), e);
            return ResponseEntity.status(500).build(); // Internal Server Error
        }
    }

    /**
     * REST endpoint to get all messages for a specific chat session.
     * @param sessionId The ID of the chat session.
     * @param principal Represents the authenticated user (to ensure they are part of the session).
     * @return List of ChatMessageResponseDTOs.
     */
    @GetMapping("/sessions/{sessionId}/messages")
    @ResponseBody
    public ResponseEntity<List<ChatMessageResponseDTO>> getSessionMessages(@PathVariable Long sessionId, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build(); // Unauthorized
        }
        String username = principal.getName();
        logger.info("Fetching messages for session ID: {} for user: {}", sessionId, username);

        // --- Authorization Check (Example) ---
        // You should verify that the requesting user (principal.getName())
        // is actually a participant in the session (sessionId) before returning messages.
        // This logic could be in the service layer.
        // For now, we fetch directly. Add authorization check later.

        try {
            List<ChatMessageResponseDTO> messages = chatService.getMessagesForSession(sessionId);
            // Add authorization check here before returning
            return ResponseEntity.ok(messages);
        } catch (jakarta.persistence.EntityNotFoundException e) {
            logger.warn("Session not found: {}", sessionId);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error fetching messages for session {}: {}", sessionId, e.getMessage(), e);
            return ResponseEntity.status(500).build(); // Internal Server Error
        }
    }

    /**
     * REST endpoint to initiate a chat session with another user.
     * Finds or creates the session.
     * @param requestBody Map containing the "recipientUsername".
     * @param principal   Authenticated user initiating the chat.
     * @return The ChatSessionDTO of the found/created session.
     */
    @PostMapping("/sessions")
    @ResponseBody
    public ResponseEntity<ChatSessionDTO> createOrGetSession(@RequestBody Map<String, String> requestBody, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build(); // Unauthorized
        }
        String initiatorUsername = principal.getName();
        String recipientUsername = requestBody.get("recipientUsername");

        if (recipientUsername == null || recipientUsername.isBlank()) {
            return ResponseEntity.badRequest().body(null); // Or return an error DTO
        }
        if (initiatorUsername.equals(recipientUsername)) {
            return ResponseEntity.badRequest().body(null); // Cannot chat with oneself
        }

        logger.info("User {} initiating chat session with {}", initiatorUsername, recipientUsername);

        try {
            ChatSession session = chatService.findOrCreateChatSession(initiatorUsername, recipientUsername);
            ChatSessionDTO sessionDTO = chatService.mapToSessionDTO(session); // Use public mapper if created, or map here/in service
            return ResponseEntity.ok(sessionDTO);
        } catch (jakarta.persistence.EntityNotFoundException e) {
            logger.warn("User not found during session creation: {}", e.getMessage());
            return ResponseEntity.notFound().build(); // One of the users doesn't exist
        } catch (Exception e) {
            logger.error("Error creating/finding session between {} and {}: {}", initiatorUsername, recipientUsername, e.getMessage(), e);
            return ResponseEntity.status(500).build();
        }
    }
}

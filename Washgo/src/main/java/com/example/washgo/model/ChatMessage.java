package com.example.washgo.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Represents a chat message object exchanged via WebSocket.
 * This is a Data Transfer Object (DTO) used for communication,
 * distinct from a potential database entity.
 */
@Data // Lombok annotation to generate getters, setters, toString, equals, hashCode
@NoArgsConstructor // Lombok annotation for no-args constructor
@AllArgsConstructor // Lombok annotation for all-args constructor
public class ChatMessage {

    /**
     * The content of the chat message.
     */
    private String content;

    /**
     * The username of the message sender.
     * Used to identify the sender in the chat UI.
     */
    private String senderUsername;

    /**
     * The username of the message recipient.
     * Used for routing the message to a specific user's queue.
     * Can be null or a specific topic name for group/broadcast messages.
     */
    private String recipientUsername;

    /**
     * The timestamp when the message was sent (can be set by server or client).
     * Optional for basic functionality but useful for display.
     */
    private LocalDateTime timestamp;

    // You might add other fields later, like message type (CHAT, JOIN, LEAVE),
    // session ID, etc., as the functionality grows.

}

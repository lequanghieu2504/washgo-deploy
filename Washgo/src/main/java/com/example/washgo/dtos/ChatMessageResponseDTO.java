package com.example.washgo.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO representing a chat message sent back to clients, potentially including persisted info.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageResponseDTO {
    private Long id; // The ID from the database
    private Long sessionId;
    private String senderUsername;
    private String recipientUsername; // Keep this for client-side routing/display logic
    private String content;
    private LocalDateTime sentAt; // The timestamp from the database
}

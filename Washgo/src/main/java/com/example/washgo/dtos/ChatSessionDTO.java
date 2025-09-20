package com.example.washgo.dtos;

import com.example.washgo.model.ChatMessage; // Assuming ChatMessage is the DTO from previous step
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO representing basic information about a chat session for client display.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatSessionDTO {
    private Long id;
    private String participant1Username;
    private String participant2Username;
    private LocalDateTime createdAt;
    private ChatMessage lastMessage; // DTO for the last message
}

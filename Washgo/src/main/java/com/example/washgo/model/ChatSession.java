package com.example.washgo.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Represents a chat session between two users.
 */
@Data
@Entity
@Table(name = "chat_session", indexes = {
        @Index(name = "idx_chatsession_user1", columnList = "user1_id"),
        @Index(name = "idx_chatsession_user2", columnList = "user2_id")
})
public class ChatSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user1_id", nullable = false)
    @ToString.Exclude // Avoid recursion in toString
    @EqualsAndHashCode.Exclude // Avoid recursion in equals/hashCode
    private UserAccount user1;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user2_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private UserAccount user2;

    @CreationTimestamp // Automatically set by Hibernate on creation
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Relationship to messages within this session
    @OneToMany(mappedBy = "chatSession", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<ChatMessageEntity> messages = new ArrayList<>();

    // Convenience method to add a message
    public void addMessage(ChatMessageEntity message) {
        messages.add(message);
        message.setChatSession(this);
    }
}

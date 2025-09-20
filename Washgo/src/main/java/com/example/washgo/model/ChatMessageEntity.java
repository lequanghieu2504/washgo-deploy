package com.example.washgo.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Represents a single chat message entity stored in the database.
 */
@Data
@Entity
@Table(name = "chat_messages") // Matches schema name
public class ChatMessageEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false) // Matches schema column 'session_id'
    @ToString.Exclude // Avoid recursion in toString
    @EqualsAndHashCode.Exclude // Avoid recursion in equals/hashCode
    private ChatSession chatSession;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false) // Matches schema column 'sender_id'
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private UserAccount sender;

    @Column(nullable = false, columnDefinition = "TEXT") // Use TEXT for potentially long messages
    private String content; // Matches schema column 'message'

    @CreationTimestamp // Automatically set by Hibernate on creation
    @Column(nullable = false, updatable = false)
    private LocalDateTime sentAt; // Matches schema column 'sent_at'

}

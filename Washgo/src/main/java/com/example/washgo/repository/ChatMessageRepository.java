package com.example.washgo.repository;

import com.example.washgo.model.ChatMessageEntity;
import com.example.washgo.model.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessageEntity, Long> {

    /**
     * Finds all messages belonging to a specific chat session, ordered by the time they were sent.
     *
     * @param chatSession The chat session to retrieve messages for.
     * @return A list of ChatMessageEntity ordered by sentAt ascending.
     */
    List<ChatMessageEntity> findByChatSessionOrderBySentAtAsc(ChatSession chatSession);

    /**
     * Finds the most recent message for a specific chat session.
     *
     * @param chatSession The chat session.
     * @return A list containing the latest message (or empty if no messages).
     */
    List<ChatMessageEntity> findTopByChatSessionOrderBySentAtDesc(ChatSession chatSession);

}

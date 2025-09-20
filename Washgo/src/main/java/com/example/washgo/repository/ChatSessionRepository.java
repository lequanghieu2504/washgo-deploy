package com.example.washgo.repository;

import com.example.washgo.model.ChatSession;
import com.example.washgo.model.UserAccount;
import com.example.washgo.model.UserInformation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession, Long> {

    /**
     * Finds a chat session between two specific users, regardless of which user is user1 or user2.
     *
     * @param userA One user participant.
     * @param userB The other user participant.
     * @return An Optional containing the ChatSession if found, otherwise empty.
     */
    @Query("SELECT cs FROM ChatSession cs WHERE (cs.user1 = :userA AND cs.user2 = :userB) OR (cs.user1 = :userB AND cs.user2 = :userA)")
    Optional<ChatSession> findSessionBetweenUsers(@Param("userA") UserAccount userA, @Param("userB") UserAccount userB);

    /**
     * Finds all chat sessions where the given user is either user1 or user2.
     *
     * @param user The user to find sessions for.
     * @return A list of ChatSessions the user participates in.
     */
    @Query("SELECT cs FROM ChatSession cs WHERE cs.user1 = :user OR cs.user2 = :user ORDER BY cs.createdAt DESC")
    List<ChatSession> findSessionsForUser(@Param("user") UserInformation user);
}

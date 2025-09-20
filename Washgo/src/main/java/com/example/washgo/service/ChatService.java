package com.example.washgo.service;

import com.example.washgo.dtos.ChatMessageResponseDTO;
import com.example.washgo.dtos.ChatSessionDTO;
import com.example.washgo.model.ChatMessage; // WebSocket DTO
import com.example.washgo.model.ChatMessageEntity;
import com.example.washgo.model.ChatSession;
import com.example.washgo.model.UserAccount;
import com.example.washgo.model.UserInformation;
import com.example.washgo.repository.ChatMessageRepository;
import com.example.washgo.repository.ChatSessionRepository;
import com.example.washgo.repository.UserAccountRepository;
import com.example.washgo.repository.UserInformationRepository;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private static final Logger logger = LoggerFactory.getLogger(ChatService.class);

    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserInformationRepository userRepository;
    private final UserAccountRepository userAccountRepository;
    @Autowired
    public ChatService(ChatSessionRepository  chatSessionRepository,
                       ChatMessageRepository chatMessageRepository,
                       UserInformationRepository userRepository,UserAccountRepository userAccountRepository) {
        this.chatSessionRepository = (ChatSessionRepository) chatSessionRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.userRepository = userRepository;
        this.userAccountRepository = userAccountRepository;
    }

    /**
     * Finds an existing chat session between two users or creates a new one if none exists.
     *
     * @param username1 Username of the first participant.
     * @param username2 Username of the second participant.
     * @return The found or newly created ChatSession entity.
     * @throws EntityNotFoundException if either user is not found.
     */
    @Transactional
    public ChatSession findOrCreateChatSession(String username1, String username2) {
        UserAccount user1 = userAccountRepository.findByUsername(username1)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + username1));
        UserAccount user2 = userAccountRepository.findByUsername(username2)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + username2));

        // Check if session already exists
        Optional<ChatSession> existingSession = chatSessionRepository.findSessionBetweenUsers(user1, user2);

        if (existingSession.isPresent()) {
            logger.debug("Found existing chat session between {} and {}", username1, username2);
            return existingSession.get();
        } else {
            logger.info("Creating new chat session between {} and {}", username1, username2);
            ChatSession newSession = new ChatSession();
            newSession.setUser1(user1); // Order doesn't strictly matter due to query logic
            newSession.setUser2(user2);
            // createdAt is set automatically by @CreationTimestamp
            return chatSessionRepository.save(newSession);
        }
    }

    /**
     * Saves a chat message received via WebSocket DTO to the database.
     *
     * @param messageDto The ChatMessage DTO received from WebSocket.
     * @return ChatMessageResponseDTO representing the saved message.
     * @throws EntityNotFoundException if sender, recipient, or session cannot be determined.
     */
    @Transactional
    public ChatMessageResponseDTO saveMessage(ChatMessage messageDto) {
        // Find sender and recipient UserInformation entities
        // IMPORTANT: In a real app, get senderUsername from authenticated principal, not DTO!
        UserAccount sender = userAccountRepository.findByUsername(messageDto.getSenderUsername())
                .orElseThrow(() -> new EntityNotFoundException("Sender not found: " + messageDto.getSenderUsername()));
        UserAccount recipient = userAccountRepository.findByUsername(messageDto.getRecipientUsername())
                .orElseThrow(() -> new EntityNotFoundException("Recipient not found: " + messageDto.getRecipientUsername()));

        // Find or create the session
        ChatSession session = findOrCreateChatSession(sender.getUsername(), recipient.getUsername());

        // Create and save the message entity
        ChatMessageEntity messageEntity = new ChatMessageEntity();
        messageEntity.setChatSession(session);
        messageEntity.setSender(sender);
        messageEntity.setContent(messageDto.getContent());
        // sentAt is set automatically by @CreationTimestamp

        ChatMessageEntity savedEntity = chatMessageRepository.save(messageEntity);
        logger.info("Saved message ID: {} in session ID: {}", savedEntity.getId(), session.getId());

        // Map saved entity to Response DTO
        return mapToMessageResponseDTO(savedEntity, messageDto.getRecipientUsername());
    }

    /**
     * Retrieves all messages for a given chat session ID.
     *
     * @param sessionId The ID of the chat session.
     * @return A list of ChatMessageResponseDTOs for the session.
     * @throws EntityNotFoundException if the session is not found.
     */
    @Transactional(readOnly = true)
    public List<ChatMessageResponseDTO> getMessagesForSession(Long sessionId) {
        ChatSession session = chatSessionRepository.findById(sessionId)
                .orElseThrow(() -> new EntityNotFoundException("Chat session not found: " + sessionId));

        List<ChatMessageEntity> messages = chatMessageRepository.findByChatSessionOrderBySentAtAsc(session);

        // Determine recipient username based on who is NOT the sender in the context of the session
        // This is a simplification; a better approach might involve passing the requesting user.
        String user1Username = session.getUser1().getUsername();
        String user2Username = session.getUser2().getUsername();


        return messages.stream()
                .map(entity -> mapToMessageResponseDTO(entity,
                        entity.getSender().getUsername().equals(user1Username) ? user2Username : user1Username))
                .collect(Collectors.toList());
    }

    /**
     * Retrieves all chat sessions for a given user.
     *
     * @param username The username of the user.
     * @return A list of ChatSessionDTOs.
     * @throws EntityNotFoundException if the user is not found.
     */
    @Transactional(readOnly = true)
    public List<ChatSessionDTO> getUserChatSessions(String username) {
        UserInformation user = userRepository.findByAccountUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + username));

        List<ChatSession> sessions = chatSessionRepository.findSessionsForUser(user);

        return sessions.stream()
                .map(this::mapToSessionDTO) // Calls the public method below
                .collect(Collectors.toList());
    }


    // --- Helper Mapping Methods ---

    /**
     * Maps a ChatSession entity to a ChatSessionDTO.
     * Now public so it can be called from ChatController.
     * @param session The ChatSession entity.
     * @return The corresponding ChatSessionDTO.
     */
    public ChatSessionDTO mapToSessionDTO(ChatSession session) { // <-- Changed from private to public
        ChatMessage lastMessageDto = null;
        List<ChatMessageEntity> lastMessageEntityList = chatMessageRepository.findTopByChatSessionOrderBySentAtDesc(session);
        if (!lastMessageEntityList.isEmpty()) {
            ChatMessageEntity lastMessageEntity = lastMessageEntityList.get(0);
            // Determine recipient for the last message DTO
            String recipientUsername = lastMessageEntity.getSender().getId().equals(session.getUser1().getId()) ?
                    session.getUser2().getUsername() : session.getUser1().getUsername();
            lastMessageDto = mapToMessageDTO(lastMessageEntity, recipientUsername); // Use the simpler DTO here
        }


        return new ChatSessionDTO(
                session.getId(),
                session.getUser1().getUsername(),
                session.getUser2().getUsername(),
                session.getCreatedAt(),
                lastMessageDto
        );
    }

    // This can remain private as it's only used internally by saveMessage and getMessagesForSession
    private ChatMessageResponseDTO mapToMessageResponseDTO(ChatMessageEntity entity, String recipientUsername) {
        return new ChatMessageResponseDTO(
                entity.getId(),
                entity.getChatSession().getId(),
                entity.getSender().getUsername(),
                recipientUsername, // Pass recipient username explicitly
                entity.getContent(),
                entity.getSentAt()
        );
    }

    // This can remain private as it's only used internally by mapToSessionDTO
    private ChatMessage mapToMessageDTO(ChatMessageEntity entity, String recipientUsername) {
        return new ChatMessage(
                entity.getContent(),
                entity.getSender().getUsername(),
                recipientUsername, // Pass recipient username explicitly
                entity.getSentAt()
        );
    }
}

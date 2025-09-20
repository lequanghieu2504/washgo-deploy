// src/main/java/com/example/washgo/service/FeedbackService.java
package com.example.washgo.service;

import com.example.washgo.dtos.FeedbackRequestDTO;
import com.example.washgo.dtos.FeedbackReadDTO;
import com.example.washgo.dtos.MediaDTO;
import com.example.washgo.enums.BookingStatus;
//import com.example.washgo.mapper.FeedbackMapper;
import com.example.washgo.mapper.FeedbackMapper;
import com.example.washgo.model.*;
import com.example.washgo.repository.FeedbackRepository;
import com.example.washgo.util.SecurityUtils;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private static final Logger logger = LoggerFactory.getLogger(FeedbackService.class);

    private final FeedbackRepository feedbackRepository;
    private final BookingService bookingService;
    private final CarwashService carwashService;
    private final FeedbackMapper feedbackMapper;
    private final UserRegistrationService userService;
    private final SecurityUtils securityUtils;
    private final MediaAppService mediaAppService; // ✅ để lấy media gắn feedback

    // --- CREATE ---
    @Transactional
    public ResponseEntity<?> createFeedback(FeedbackRequestDTO req, Authentication authentication) {
        try {
            Long clientId = securityUtils.getAuthenticatedUserId(authentication);

            // 1) Kiểm tra booking
            Booking booking = bookingService.findById(req.getBookingId());
            if (booking == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Booking not found: " + req.getBookingId());
            }

            // 2) Booking DONE?
            if (!BookingStatus.DONE.equals(booking.getStatus())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("The booking must be marked as 'DONE' before feedback can be submitted.");
            }

            // 3) Client của booking khớp người đang login?
            if (booking.getUserInformation() == null ||
                    !booking.getUserInformation().getId().equals(clientId)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Authenticated client does not match the booking's client.");
            }

            // 4) Không trùng feedback cho booking
            if (feedbackRepository.findByBookingId(req.getBookingId()).isPresent()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Feedback has already been submitted for booking ID: " + req.getBookingId());
            }

            // 5) Booking thuộc carwash được gửi lên?
            CarwashProfile carwash = booking.getCarwash();
            if (carwash == null || !carwash.getId().equals(req.getCarwashID())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Booking does not belong to the specified carwash.");
            }

            // 6) Validate rating
            if (req.getRating() == null || req.getRating() < 1 || req.getRating() > 5) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Rating must be between 1 and 5.");
            }

            // Tạo Feedback (media sẽ upload qua endpoint riêng)
            Feedback feedback = new Feedback();
            feedback.setRating(req.getRating());
            feedback.setComment(req.getComment());
            feedback.setBooking(booking);
            feedback.setClientId(clientId);
            feedback.setCarwash(carwash);

            Feedback saved = feedbackRepository.save(feedback);
            logger.info("Feedback created successfully for booking ID: {}", req.getBookingId());

            // Cập nhật rating carwash
            updateCarwashRating(carwash.getId());

            // Map -> ReadDTO + enrich media
            FeedbackReadDTO dto = feedbackMapper.toFeedbackReadDTO(saved);
            List<MediaDTO> media = mediaAppService.listFeedbackMedia(saved.getId());
            dto.setMedia(media);

            return ResponseEntity.status(HttpStatus.CREATED).body(dto);

        } catch (Exception ex) {
            logger.error("Error creating feedback: {}", ex.getMessage(), ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occurred: " + ex.getMessage());
        }
    }

    // --- READ ---
    @Transactional(readOnly = true)
    public FeedbackReadDTO getFeedbackById(Long id) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Feedback not found with ID: " + id));

        FeedbackReadDTO dto = feedbackMapper.toFeedbackReadDTO(feedback);
        List<MediaDTO> media = mediaAppService.listFeedbackMedia(feedback.getId());
        dto.setMedia(media);
        return dto;
    }

    @Transactional(readOnly = true)
    public List<FeedbackReadDTO> getFeedbacksByCarwash(Long carwashId) {
        List<Feedback> list = feedbackRepository.findByCarwashId(carwashId);
        return list.stream().map(f -> {
            FeedbackReadDTO dto = feedbackMapper.toFeedbackReadDTO(f);
            List<MediaDTO> media = mediaAppService.listFeedbackMedia(f.getId());
            dto.setMedia(media);
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FeedbackReadDTO> getFeedbackByBooking(Long bookingId) {
        Optional<Feedback> list = feedbackRepository.findByBookingId(bookingId);
        return list.stream().map(f -> {
            FeedbackReadDTO dto = feedbackMapper.toFeedbackReadDTO(f);
            List<MediaDTO> media = mediaAppService.listFeedbackMedia(f.getId());
            dto.setMedia(media);
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FeedbackReadDTO> getFeedbacksByClient(Long clientId, String authenticatedUsername) {
        UserInformation requestedClient = userService.findUserEntityById(clientId);
        if (!requestedClient.getAccount().getUsername().equals(authenticatedUsername)) {
            throw new AccessDeniedException("User '" + authenticatedUsername + "' cannot access feedback for client ID " + clientId);
        }
        List<Feedback> list = feedbackRepository.findByClientId(clientId);
        return list.stream().map(f -> {
            FeedbackReadDTO dto = feedbackMapper.toFeedbackReadDTO(f);
            List<MediaDTO> media = mediaAppService.listFeedbackMedia(f.getId());
            dto.setMedia(media);
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FeedbackReadDTO> getAllFeedbacks() {
        List<Feedback> list = feedbackRepository.findAll();
        return list.stream().map(f -> {
            FeedbackReadDTO dto = feedbackMapper.toFeedbackReadDTO(f);
            List<MediaDTO> media = mediaAppService.listFeedbackMedia(f.getId());
            dto.setMedia(media);
            return dto;
        }).collect(Collectors.toList());
    }

    // --- DELETE ---
    @Transactional
    public void deleteFeedback(Long id, String authenticatedUsername, List<String> roles) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Feedback not found with ID: " + id));

        boolean isAdmin = roles.contains("ROLE_ADMIN");
        boolean isClientOwner = feedback.getBooking().getUserInformation()
                .getAccount().getUsername().equals(authenticatedUsername);

        if (!isAdmin && !isClientOwner) {
            throw new AccessDeniedException("User '" + authenticatedUsername + "' does not have permission to delete feedback ID " + id);
        }

        Long carwashId = feedback.getCarwash().getId();
        feedbackRepository.delete(feedback);
        logger.info("Feedback deleted successfully: ID {}", id);

        updateCarwashRating(carwashId);
    }

    // --- Helper: cập nhật rating carwash ---
    private void updateCarwashRating(Long carwashId) {
        // ❗ Dùng đúng findById carwash, không dùng ...ByUserId
        CarwashProfile carwash = carwashService.findCarwashByUserId(carwashId);
        Double newAverage = feedbackRepository.getAverageRatingByCarwashId(carwashId);
        Integer newCount = feedbackRepository.getCountByCarwashId(carwashId);

        carwash.setAverageRating(newAverage != null ? newAverage : 0.0);
        carwash.setRatingCount(newCount != null ? newCount : 0);
        carwashService.save(carwash);
        logger.info("Updated rating for Carwash ID {}: Average = {}, Count = {}", carwashId, carwash.getAverageRating(), carwash.getRatingCount());
    }
}

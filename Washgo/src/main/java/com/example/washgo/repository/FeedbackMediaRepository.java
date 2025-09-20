package com.example.washgo.repository;

import com.example.washgo.model.FeedbackMedia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FeedbackMediaRepository extends JpaRepository<FeedbackMedia, Long> {
    List<FeedbackMedia> findByFeedback_IdOrderBySortOrderAsc(Long feedbackId);
    long countByMedia_Id(UUID mediaId);
    Optional<FeedbackMedia> findByFeedback_IdAndMedia_Id(Long feedbackId, UUID mediaId);
}
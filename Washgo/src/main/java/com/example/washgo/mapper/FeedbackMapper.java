package com.example.washgo.mapper;

import com.example.washgo.dtos.FeedbackReadDTO;
import com.example.washgo.model.Feedback;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class FeedbackMapper {

    public FeedbackReadDTO toFeedbackReadDTO(Feedback f) {
        if (f == null) return null;
        FeedbackReadDTO dto = new FeedbackReadDTO();
        dto.setId(f.getId());
        dto.setRating(f.getRating());
        dto.setComment(f.getComment());
        dto.setCreatedAt(f.getCreatedAt());
        dto.setBookingId(f.getBooking() != null ? f.getBooking().getId() : null);

        if (f.getCarwash() != null) {
            dto.setCarwashId(f.getCarwash().getId());
            dto.setCarwashName(f.getCarwash().getCarwashName());
        }

        dto.setClientId(f.getClientId());
        // set clientUsername nếu có
        if (f.getBooking() != null && f.getBooking().getUserInformation() != null
                && f.getBooking().getUserInformation().getAccount() != null) {
            dto.setClientUsername(f.getBooking().getUserInformation().getAccount().getUsername());
        }

        // media sẽ được Service set sau (dto.setMedia(...))
        return dto;
    }

    public List<FeedbackReadDTO> toFeedbackReadDTOList(List<Feedback> list) {
        return list == null ? List.of() : list.stream().map(this::toFeedbackReadDTO).collect(Collectors.toList());
    }
}

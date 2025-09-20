package com.example.washgo.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.washgo.model.CarwashMedia;

public interface CarwashMediaRepository extends JpaRepository<CarwashMedia, Long> {
    Optional<CarwashMedia> findByCarwash_IdAndMedia_Id(Long carwashId, UUID mediaId);
    long countByMedia_Id(UUID mediaId);
    List<CarwashMedia> findByCarwash_IdOrderBySortOrderAsc(Long carwashId);
}


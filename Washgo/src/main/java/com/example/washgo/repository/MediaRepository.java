package com.example.washgo.repository;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.washgo.media.MediaEntity;

public interface MediaRepository extends JpaRepository<MediaEntity, UUID> {}

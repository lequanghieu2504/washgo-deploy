package com.example.washgo.media;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@MappedSuperclass
@Getter @Setter
public abstract class BaseAuditable {
    @Column(nullable = false, updatable = false)
    protected LocalDateTime createdAt;

    @Column(nullable = false)
    protected LocalDateTime updatedAt;

    protected LocalDateTime deletedAt;

    @PrePersist
    protected void onCreate() {
        var now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

package com.example.washgo.model;

import com.example.washgo.media.MediaEntity;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(
        name = "carwash_media",
        indexes = {
                @Index(name = "idx_carwash_media_carwash", columnList = "carwash_id")
        }
)
public class CarwashMedia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Nhiều media thuộc một carwash */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "carwash_id", nullable = false)
    @JsonBackReference("carwash-media")
    private CarwashProfile carwash;

    /** Media (ảnh/video) đã lưu local (MediaEntity) */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "media_id", nullable = false)
    private MediaEntity media;

    /** Đánh dấu media bìa cho carwash (duy nhất theo logic ở service) */
    @Column(nullable = false)
    private boolean cover = false;

    /** Thứ tự hiển thị trong gallery */
    @Column(nullable = false)
    private int sortOrder = 0;
}

package com.example.washgo.media;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

@Entity
@Table(
        name = "media",
        indexes = {
                @Index(name = "idx_media_key", columnList = "key"),
                @Index(name = "idx_media_visibility", columnList = "visibility"),
                @Index(name = "idx_media_type", columnList = "mediaType")
        }
)
@Getter @Setter
public class MediaEntity extends BaseAuditable {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id; // thích dùng Long thì đổi sang @GeneratedValue(strategy = IDENTITY) private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private MediaType mediaType = MediaType.IMAGE; // IMAGE | VIDEO

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private StorageType storageType = StorageType.LOCAL; // hiện tại LOCAL

    /** Đường dẫn tương đối trong thư mục local, vd: media/USER_AVATAR/{userId}/{uuid}.webp */
    @Column(nullable = false, columnDefinition = "text")
    private String key;

    private String originalFilename;

    @Column(nullable = false, length = 100)
    private String mime; // image/jpeg, image/webp, video/mp4, ...

    @Column(length = 10)
    private String ext;  // jpg/png/webp/mp4/webm...

    @Column(nullable = false)
    private long sizeBytes;

    /** Với ảnh: width/height ảnh; với video: kích thước khung hình (nếu có) */
    private Integer width;
    private Integer height;

    /** Với video: thời lượng (ms) nếu trích xuất được; ảnh thì null */
    private Long durationMs;

    /** (tuỳ) metadata video */
    private Integer frameRate;     // fps ~
    private Integer audioChannels; // 0 nếu không audio

    @Column(length = 64)
    private String checksumSha256;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private Visibility visibility = Visibility.PRIVATE;

    /**
     * JSON chuỗi cho các biến thể:
     * IMAGE: {"original":"...","thumb":"...","medium":"..."}
     * VIDEO: {"original":"...","mp4_720":"...","webm_720":"...","poster":"..."}
     */
    @Column(columnDefinition = "text")
    private String variants;

    private Long createdBy;
}

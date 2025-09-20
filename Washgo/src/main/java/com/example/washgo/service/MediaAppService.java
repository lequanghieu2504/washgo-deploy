package com.example.washgo.service;

import ch.qos.logback.core.net.SyslogOutputStream;
import com.example.washgo.media.MediaEntity;
import com.example.washgo.media.MediaType;
import com.example.washgo.media.StorageType;
import com.example.washgo.media.Visibility;
import com.example.washgo.model.CarwashMedia;
import com.example.washgo.model.CarwashProfile;
import com.example.washgo.model.FeedbackMedia;
import com.example.washgo.model.UserInformation;
import com.example.washgo.repository.*;
import com.example.washgo.dtos.MediaDTO;
import com.example.washgo.storage.FileStorageService;
import com.example.washgo.storage.StoredFile;
import com.example.washgo.model.Feedback;
import com.example.washgo.model.FeedbackMedia;
import com.example.washgo.repository.FeedbackRepository;
import com.example.washgo.repository.FeedbackMediaRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import java.util.Objects;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MediaAppService {

    private final MediaRepository mediaRepo;
    private final CarwashProfileRepository carwashRepo;
    private final CarwashMediaRepository carwashMediaRepo;
    private final UserInformationRepository userRepo;
    private final FileStorageService storage;

    private final FeedbackRepository feedbackRepo;
    private final FeedbackMediaRepository feedbackMediaRepo;

    @PersistenceContext
    private EntityManager em;

    // ---- Helpers ----
    private static String extFromMime(String mime) {
        if (mime == null) return "bin";
        return switch (mime) {
            case "image/jpeg" -> "jpg";
            case "image/png"  -> "png";
            case "image/webp" -> "webp";
            case "video/mp4"  -> "mp4";
            case "video/webm" -> "webm";
            default -> "bin";
        };
    }

    private static MediaType typeFromMime(String mime) {
        if (mime != null && mime.startsWith("video/")) return MediaType.VIDEO;
        return MediaType.IMAGE;
    }

    private String buildKeyForCarwash(Long carwashId, String ext) {
        return "media/CARWASH/%d/%s.%s".formatted(carwashId, UUID.randomUUID(), ext);
    }

    private String buildKeyForAvatar(Long userId, String ext) {
        return "media/USER_AVATAR/%d/%s.%s".formatted(userId, UUID.randomUUID(), ext);
    }

    private MediaDTO toDTO(MediaEntity m, Integer sortOrder, boolean cover) {
        String url = m.getVisibility() == Visibility.PUBLIC
                ? storage.publicUrl(m.getKey())
                : "/api/media/serve/" + m.getId(); // private
        return new MediaDTO(
                m.getId(), url, m.getMediaType().name(), m.getMime(),
                m.getSizeBytes(), m.getWidth(), m.getHeight(),
                sortOrder, cover
        );
    }

    // ---- Use cases ----

    /** Upload media gắn vào Carwash gallery */
    public MediaDTO uploadCarwashMedia(Long carwashId, MultipartFile file, boolean cover, Integer sortOrder, Visibility visibility)
            throws IOException {
        CarwashProfile cw = carwashRepo.findById(carwashId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Carwash not found"));

        if (file == null || file.isEmpty())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File empty");

        String mime = file.getContentType();
        String ext = extFromMime(mime);
        String key = buildKeyForCarwash(carwashId, ext);

        StoredFile stored = storage.save(file.getInputStream(), file.getSize(), mime, key);

        MediaEntity media = new MediaEntity();
        media.setMediaType(typeFromMime(mime));
        media.setStorageType(com.example.washgo.media.StorageType.LOCAL);
        media.setKey(stored.key());
        media.setOriginalFilename(file.getOriginalFilename());
        media.setMime(mime != null ? mime : stored.mime());
        media.setExt(ext);
        media.setSizeBytes(stored.sizeBytes());
        media.setWidth(stored.width());
        media.setHeight(stored.height());
        media.setVisibility(visibility != null ? visibility : Visibility.PRIVATE);
        media = mediaRepo.save(media);

        CarwashMedia link = new CarwashMedia();
        link.setCarwash(cw);
        link.setMedia(media);
        link.setCover(cover);
        link.setSortOrder(sortOrder != null ? sortOrder : 0);
        carwashMediaRepo.save(link);

        return toDTO(media, link.getSortOrder(), link.isCover());
    }

    /** Lấy danh sách media của Carwash */
    public List<MediaDTO> listCarwashMedia(Long carwashId) {
        return carwashMediaRepo.findByCarwash_IdOrderBySortOrderAsc(carwashId)
                .stream()
                .map(cm -> toDTO(cm.getMedia(), cm.getSortOrder(), cm.isCover()))
                .toList();
    }

    public MediaDTO getUserAvatarMeta(Long userId) {
        UserInformation user = userRepo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        if (user.getAvatar() == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User has no avatar");
        }
        return toDTO(user.getAvatar(), null, false);
    }

    public String getUserAvatarUrl(Long userId) {
        MediaDTO dto = getUserAvatarMeta(userId);
        return dto.url();
    }

    /** Upload avatar cho UserInformation */
    @Transactional
    public MediaDTO uploadUserAvatar(Long userId, MultipartFile file) throws IOException {
        UserInformation user = userRepo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File empty");
        }

        // giữ lại avatar cũ (nếu có) để GC sau khi gỡ liên kết
        MediaEntity oldAvatar = user.getAvatar();

        String mime = file.getContentType();
        String ext = extFromMime(mime);
        String key = buildKeyForAvatar(userId, ext);

        StoredFile stored = storage.save(file.getInputStream(), file.getSize(), mime, key);

        MediaEntity media = new MediaEntity();
        media.setMediaType(MediaType.IMAGE); // avatar là ảnh
        media.setStorageType(StorageType.LOCAL);
        media.setKey(stored.key());
        media.setOriginalFilename(file.getOriginalFilename());
        media.setMime(mime != null ? mime : stored.mime());
        media.setExt(ext);
        media.setSizeBytes(stored.sizeBytes());
        media.setWidth(stored.width());
        media.setHeight(stored.height());
        media.setVisibility(Visibility.PUBLIC); // hoặc PRIVATE tùy policy
        media = mediaRepo.save(media);

        // gắn avatar mới
        user.setAvatar(media);
        userRepo.save(user);

        // 💡 đảm bảo thay đổi đã flush để count reference chính xác
        em.flush();

        // GC avatar cũ nếu không còn ai dùng
        if (oldAvatar != null) {
            maybeGarbageCollect(oldAvatar.getId());
        }

        return toDTO(media, null, false);
    }
    /** Tải Media theo id (trả Resource) */
    public org.springframework.core.io.Resource loadMediaFile(UUID mediaId) throws IOException {
        MediaEntity media = mediaRepo.findById(mediaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Media not found"));
        // TODO: kiểm tra quyền nếu cần khi visibility = PRIVATE
        return storage.loadAsResource(media.getKey());
    }

    private String buildKeyForFeedback(Long feedbackId, String ext) {
        return "media/FEEDBACK/%d/%s.%s".formatted(feedbackId, java.util.UUID.randomUUID(), ext);
    }

    // ✅ LIST media của feedback
    public java.util.List<MediaDTO> listFeedbackMedia(Long feedbackId) {
        return feedbackMediaRepo.findByFeedback_IdOrderBySortOrderAsc(feedbackId)
                .stream()
                .map(fm -> toDTO(fm.getMedia(), fm.getSortOrder(), fm.isCover()))
                .toList();
    }

    // (khuyến nghị) Upload media cho feedback
    public MediaDTO uploadFeedbackMedia(Long feedbackId, org.springframework.web.multipart.MultipartFile file,
                                        boolean cover, Integer sortOrder, Visibility visibility)
            throws java.io.IOException {
        Feedback fb = feedbackRepo.findById(feedbackId)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Feedback not found"));

        if (file == null || file.isEmpty()) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST, "File empty");
        }

        String mime = file.getContentType();
        String ext = extFromMime(mime);
        String key = buildKeyForFeedback(feedbackId, ext);

        StoredFile stored = storage.save(file.getInputStream(), file.getSize(), mime, key);

        MediaEntity media = new MediaEntity();
        media.setMediaType(typeFromMime(mime));
        media.setStorageType(com.example.washgo.media.StorageType.LOCAL);
        media.setKey(stored.key());
        media.setOriginalFilename(file.getOriginalFilename());
        media.setMime(mime != null ? mime : stored.mime());
        media.setExt(ext);
        media.setSizeBytes(stored.sizeBytes());
        media.setWidth(stored.width());
        media.setHeight(stored.height());
        media.setVisibility(visibility != null ? visibility : Visibility.PRIVATE);
        media = mediaRepo.save(media);

        FeedbackMedia link = new FeedbackMedia();
        link.setFeedback(fb);
        link.setMedia(media);
        link.setCover(cover);
        link.setSortOrder(sortOrder != null ? sortOrder : 0);
        feedbackMediaRepo.save(link);

        return toDTO(media, link.getSortOrder(), link.isCover());
    }

    @Transactional
    public void unlinkCarwashMedia(Long carwashId, UUID mediaId, Authentication auth) {
        CarwashMedia link = carwashMediaRepo.findByCarwash_IdAndMedia_Id(carwashId, mediaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Link not found"));

        boolean wasCover = link.isCover();
        carwashMediaRepo.delete(link);

        // Nếu vừa xóa cover -> set cover cho mục đầu tiên còn lại
        if (wasCover) {
            List<CarwashMedia> remain = carwashMediaRepo.findByCarwash_IdOrderBySortOrderAsc(carwashId);
            if (!remain.isEmpty()) {
                remain.get(0).setCover(true);
                carwashMediaRepo.save(remain.get(0));
            }
        }

        maybeGarbageCollect(mediaId);
    }

    @Transactional
    public void unlinkFeedbackMedia(Long feedbackId, UUID mediaId, Authentication auth) {
        FeedbackMedia link = feedbackMediaRepo.findByFeedback_IdAndMedia_Id(feedbackId, mediaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Link not found"));

        // (TÙY) kiểm tra quyền: chủ feedback (client đã viết) hoặc admin
        // securityUtils.assertFeedbackOwnerOrAdmin(auth, feedbackId);

        feedbackMediaRepo.delete(link);
        maybeGarbageCollect(mediaId);
    }

    /** Admin-only hard delete (xóa mọi link, xóa file, xóa media) */
    @Transactional
    public void hardDeleteMedia(UUID mediaId, Authentication auth) throws IOException {
        // securityUtils.assertAdmin(auth);
        MediaEntity media = mediaRepo.findById(mediaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Media not found"));

        // Xóa mọi link
        carwashMediaRepo.findAll().stream()
                .filter(l -> l.getMedia().getId().equals(mediaId))
                .forEach(carwashMediaRepo::delete);

        feedbackMediaRepo.findAll().stream()
                .filter(l -> l.getMedia().getId().equals(mediaId))
                .forEach(feedbackMediaRepo::delete);

        // Unset avatar nếu trỏ vào media này (tùy, có thể làm JPQL update)
        userRepo.findAll().stream()
                .filter(u -> u.getAvatar() != null && mediaId.equals(u.getAvatar().getId()))
                .forEach(u -> { u.setAvatar(null); userRepo.save(u); });

        // Xóa file + record
        storage.delete(media.getKey());
        mediaRepo.delete(media);
    }

    /** Nếu media không còn reference -> xóa file + record */
    private void maybeGarbageCollect(UUID mediaId) {
        long refs = carwashMediaRepo.countByMedia_Id(mediaId)
                + feedbackMediaRepo.countByMedia_Id(mediaId)
                + userRepo.countByAvatar_Id(mediaId);

        if (refs == 0) {
            mediaRepo.findById(mediaId).ifPresent(m -> {
                try {
                    storage.delete(m.getKey()); // xóa file local
                } catch (IOException e) {
                    mediaRepo.delete(m);
                }
                mediaRepo.delete(m);
            });
        }
    }

    @Transactional
    public void removeUserAvatar(Long userId, Authentication auth) {

        UserInformation user = userRepo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        MediaEntity avatar = user.getAvatar();
        if (avatar == null) {
            // Không có avatar -> coi như xong
            return;
        }

        UUID avatarId = avatar.getId();
        // gỡ liên kết
        user.setAvatar(null);
        userRepo.save(user);

        // nếu media này không còn ai tham chiếu -> xóa file + record
        maybeGarbageCollect(avatarId);
    }
}

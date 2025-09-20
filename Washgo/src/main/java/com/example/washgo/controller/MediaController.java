package com.example.washgo.controller;


import com.example.washgo.media.Visibility;
import com.example.washgo.media.MediaEntity;
import com.example.washgo.repository.MediaRepository;
import com.example.washgo.service.MediaAppService;
import com.example.washgo.dtos.MediaDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
public class MediaController {

    private final MediaAppService mediaService;
    private final MediaRepository mediaRepo;

    // Upload media cho carwash (ảnh hoặc video)
    @PostMapping(path = "/carwash/{carwashId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
//    @PreAuthorize("hasRole('CARWASH')")
    public MediaDTO uploadCarwashMedia(
            @PathVariable Long carwashId,
            @RequestPart("file") MultipartFile file,
            @RequestParam(defaultValue = "false") boolean cover,
            @RequestParam(defaultValue = "0") Integer sortOrder,
            @RequestParam(required = false) Visibility visibility // PUBLIC | PRIVATE
    ) throws IOException {
        return mediaService.uploadCarwashMedia(carwashId, file, cover, sortOrder, visibility);
    }

    // Danh sách media của carwash
    @GetMapping("/carwash/{carwashId}")
    public List<MediaDTO> listCarwashMedia(@PathVariable Long carwashId) {
        return mediaService.listCarwashMedia(carwashId);
    }

    // Upload avatar user
    @PostMapping(path = "/users/{userId}/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public MediaDTO uploadUserAvatar(
            @PathVariable Long userId,
            @RequestPart("file") MultipartFile file
    ) throws IOException {
        return mediaService.uploadUserAvatar(userId, file);
    }

    @GetMapping("/users/{userId}/avatar")
    // @PreAuthorize("isAuthenticated()")
    public MediaDTO getUserAvatarMeta(@PathVariable Long userId) {
        return mediaService.getUserAvatarMeta(userId);
    }

    @GetMapping("/users/{userId}/avatar/redirect")
    // @PreAuthorize("isAuthenticated()") // nếu avatar PRIVATE thì bước /api/media/serve/** sẽ tự chặn theo security
    public ResponseEntity<Void> redirectUserAvatar(@PathVariable Long userId) {
        String url = mediaService.getUserAvatarUrl(userId);
        // Có thể thêm logic tạo absolute URL nếu cần:
        // if (url.startsWith("/")) { url = ServletUriComponentsBuilder.fromCurrentContextPath().path(url).toUriString(); }
        return ResponseEntity.status(HttpStatus.FOUND).location(URI.create(url)).build();
    }

    // Serve PRIVATE media qua API (PUBLIC thì truy cập trực tiếp /uploads/**)
    @GetMapping("/serve/{mediaId}")
    public ResponseEntity<Resource> serve(@PathVariable UUID mediaId) throws IOException {
        MediaEntity media = mediaRepo.findById(mediaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Media not found"));

        // (Tuỳ) kiểm tra quyền nếu media PRIVATE

        Resource file = mediaService.loadMediaFile(mediaId);

        MediaType contentType = Optional.ofNullable(media.getMime())
                .map(MediaType::parseMediaType)
                .orElse(MediaType.APPLICATION_OCTET_STREAM);

        String filename = Optional.ofNullable(media.getOriginalFilename())
                .orElse(mediaId.toString());
        String cd = ContentDisposition.inline()
                .filename(URLEncoder.encode(filename, StandardCharsets.UTF_8), StandardCharsets.UTF_8)
                .build()
                .toString();

        return ResponseEntity.ok()
                .contentType(contentType)
                .header(HttpHeaders.CONTENT_DISPOSITION, cd)
                .cacheControl(CacheControl.maxAge(Duration.ofDays(30)).cachePublic())
                .body(file);
    }

    @DeleteMapping("/carwash/{carwashId}/{mediaId}")
//    @PreAuthorize("hasRole('ADMIN') or hasRole('OWNER')")
    public ResponseEntity<Void> unlinkCarwash(
            @PathVariable Long carwashId,
            @PathVariable UUID mediaId,
            Authentication auth) {
        mediaService.unlinkCarwashMedia(carwashId, mediaId, auth);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/feedback/{feedbackId}/{mediaId}")
//    @PreAuthorize("hasRole('ADMIN') or hasRole('CLIENT')")
    public ResponseEntity<Void> unlinkFeedback(
            @PathVariable Long feedbackId,
            @PathVariable UUID mediaId,
            Authentication auth) {
        mediaService.unlinkFeedbackMedia(feedbackId, mediaId, auth);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/users/{userId}/avatar")
//    @PreAuthorize("")
    public ResponseEntity<Void> deleteUserAvatar(
            @PathVariable Long userId,
            Authentication authentication) {
        mediaService.removeUserAvatar(userId, authentication);
        return ResponseEntity.noContent().build();
    }

//    @DeleteMapping("/{mediaId}")
//    @PreAuthorize("hasRole('ADMIN')")
//    public ResponseEntity<Void> hardDelete(
//            @PathVariable UUID mediaId,
//            Authentication auth) throws IOException {
//        mediaService.hardDeleteMedia(mediaId, auth);
//        return ResponseEntity.noContent().build();
//    }


}

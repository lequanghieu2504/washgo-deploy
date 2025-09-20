package com.example.washgo.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.*;
import java.nio.file.*;

@Service
public class LocalFileStorageService implements FileStorageService {

    @Value("${file.storage.root}")
    private String rootDir;

    @Override
    public StoredFile save(InputStream in, long contentLength, String mime, String key) throws IOException {
        Path root = Paths.get(rootDir).toAbsolutePath().normalize();
        Path path = root.resolve(key).normalize();

        if (!path.startsWith(root)) throw new SecurityException("Invalid path");
        Files.createDirectories(path.getParent());

        // copy
        Files.copy(in, path, StandardCopyOption.REPLACE_EXISTING);

        // lấy width/height nếu là ảnh
        Integer w = null, h = null;
        try (InputStream is = Files.newInputStream(path)) {
            BufferedImage img = ImageIO.read(is);
            if (img != null) { w = img.getWidth(); h = img.getHeight(); }
        } catch (Exception ignored) {}

        return new StoredFile(key, Files.size(path), w, h, mime);
    }

    @Override
    public Resource loadAsResource(String key) throws IOException {
        Path root = Paths.get(rootDir).toAbsolutePath().normalize();
        Path path = root.resolve(key).normalize();
        if (!path.startsWith(root)) throw new SecurityException("Invalid path");
        if (!Files.exists(path)) throw new FileNotFoundException("Not found: " + key);
        return new FileSystemResource(path.toFile());
    }

    @Override
    public boolean exists(String key) {
        Path path = Paths.get(rootDir).resolve(key).normalize();
        return Files.exists(path);
    }

    @Override
    public void delete(String key) throws IOException {
        Path path = Paths.get(rootDir).resolve(key).normalize();
        Files.deleteIfExists(path);
    }

    @Override
    public String publicUrl(String key) {
        // Nếu đã cấu hình static-locations trỏ tới ${file.storage.root}
        return "/uploads/" + key;
    }
}

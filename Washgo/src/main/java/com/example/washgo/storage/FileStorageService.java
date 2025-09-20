package com.example.washgo.storage;

import java.io.IOException;
import java.io.InputStream;
import org.springframework.core.io.Resource;

public interface FileStorageService {
    StoredFile save(InputStream in, long contentLength, String mime, String key) throws IOException;
    Resource loadAsResource(String key) throws IOException;
    boolean exists(String key);
    void delete(String key) throws IOException;
    String publicUrl(String key); // nếu dùng map /uploads/**
}

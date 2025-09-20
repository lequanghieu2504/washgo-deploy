//package com.example.washgo.service;
//
//import com.example.washgo.config.FileUploadConfig;
//import com.example.washgo.exception.FileStorageException;
//import org.springframework.stereotype.Service;
//import org.springframework.web.multipart.MultipartFile;
//
//import java.io.IOException;
//import java.nio.file.Files;
//import java.nio.file.Path;
//import java.nio.file.Paths;
//import java.util.UUID;
//
//@Service
//public class FileStorageService {
//
//    private final Path fileStorageLocation;
//
//    public FileStorageService() {
//        this.fileStorageLocation = Paths.get(FileUploadConfig.UPLOAD_DIR)
//                .toAbsolutePath().normalize();
//        try {
//            Files.createDirectories(this.fileStorageLocation);
//        } catch (IOException ex) {
//            throw new FileStorageException("Could not create the directory where the uploaded files will be stored.", ex);
//        }
//    }
//
//    public String storeFile(MultipartFile file, String type) {
//        // Validate file size
//        validateFileSize(file, type);
//
//        // Generate unique filename
//        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
//
//        try {
//            // Create the subdirectory based on type (avatar, carwash, feedback)
//            Path targetLocation = this.fileStorageLocation.resolve(type);
//            Files.createDirectories(targetLocation);
//
//            // Copy file to target location
//            Files.copy(file.getInputStream(), targetLocation.resolve(fileName));
//
//            return type + "/" + fileName;
//        } catch (IOException ex) {
//            throw new FileStorageException("Could not store file " + fileName, ex);
//        }
//    }
//
//    private void validateFileSize(MultipartFile file, String contentType) {
//        if (contentType.startsWith("image/")) {
//            if (file.getSize() > FileUploadConfig.MAX_IMAGE_SIZE) {
//                throw new FileStorageException("File size exceeds maximum limit of 6MB for images");
//            }
//        } else if (contentType.startsWith("video/")) {
//            if (file.getSize() > FileUploadConfig.MAX_VIDEO_SIZE) {
//                throw new FileStorageException("File size exceeds maximum limit of 300MB for videos");
//            }
//        }
//    }
//}

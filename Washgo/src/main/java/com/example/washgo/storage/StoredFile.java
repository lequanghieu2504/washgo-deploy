package com.example.washgo.storage;

public record StoredFile(String key, long sizeBytes, Integer width, Integer height, String mime) {}

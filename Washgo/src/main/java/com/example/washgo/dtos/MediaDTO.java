package com.example.washgo.dtos;

import java.util.UUID;

public record MediaDTO(
        UUID id, String url, String mediaType, String mime,
        long sizeBytes, Integer width, Integer height,
        Integer sortOrder, boolean cover
) {}
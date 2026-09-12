package com.example.newbie.domain.indoor.model;

import java.util.Objects;

public record MapImage(
        String id,
        String displayName,
        String assetKey,
        int width,
        int height
) {
    public MapImage {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(displayName, "displayName must not be null");
        Objects.requireNonNull(assetKey, "assetKey must not be null");
        if (width <= 0) {
            throw new IllegalArgumentException("width must be positive");
        }
        if (height <= 0) {
            throw new IllegalArgumentException("height must be positive");
        }
    }

    public MapImage(String id, String displayName, int width, int height) {
        this(id, displayName, id, width, height);
    }
}

package com.example.newbie.api.map.dto;

import com.example.newbie.domain.indoor.model.MapImage;

public record MapImageResponse(
        String id,
        String displayName,
        String assetKey,
        int intrinsicWidth,
        int intrinsicHeight
) {
    public static MapImageResponse from(MapImage mapImage) {
        return new MapImageResponse(
                mapImage.id(),
                mapImage.displayName(),
                mapImage.assetKey(),
                mapImage.width(),
                mapImage.height()
        );
    }
}

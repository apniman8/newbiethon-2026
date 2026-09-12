package com.example.newbie.api.map.dto;

import com.example.newbie.domain.indoor.model.MapImage;

public record MapImageResponse(
        String id,
        String displayName,
        int width,
        int height
) {
    public static MapImageResponse from(MapImage mapImage) {
        return new MapImageResponse(
                mapImage.id(),
                mapImage.displayName(),
                mapImage.width(),
                mapImage.height()
        );
    }
}

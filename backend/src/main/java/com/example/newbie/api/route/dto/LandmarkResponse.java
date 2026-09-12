package com.example.newbie.api.route.dto;

import com.example.newbie.domain.indoor.model.Landmark;
import com.example.newbie.domain.indoor.model.LandmarkPosition;
import com.example.newbie.domain.indoor.model.LandmarkType;

public record LandmarkResponse(
        String id,
        LandmarkType type,
        String name,
        String description,
        LandmarkPosition position
) {
    public static LandmarkResponse from(Landmark landmark) {
        if (landmark == null) {
            return null;
        }
        return new LandmarkResponse(
                landmark.id(),
                landmark.type(),
                landmark.name(),
                landmark.description(),
                landmark.position()
        );
    }
}

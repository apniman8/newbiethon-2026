package com.example.newbie.api.route.dto;

import com.example.newbie.domain.indoor.model.ImagePoint;

public record ImagePointResponse(double x, double y) {
    public static ImagePointResponse from(ImagePoint point) {
        return new ImagePointResponse(point.x(), point.y());
    }
}

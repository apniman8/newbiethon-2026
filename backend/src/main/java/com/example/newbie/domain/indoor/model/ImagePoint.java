package com.example.newbie.domain.indoor.model;

import com.example.newbie.domain.indoor.exception.GraphDataInvalidException;

public record ImagePoint(double x, double y) {
    public ImagePoint {
        if (!Double.isFinite(x) || x < 0.0 || x > 1.0) {
            throw new GraphDataInvalidException("point.x must be between 0.0 and 1.0");
        }
        if (!Double.isFinite(y) || y < 0.0 || y > 1.0) {
            throw new GraphDataInvalidException("point.y must be between 0.0 and 1.0");
        }
    }
}

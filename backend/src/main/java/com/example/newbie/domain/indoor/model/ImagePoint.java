package com.example.newbie.domain.indoor.model;

public record ImagePoint(double x, double y) {
    public ImagePoint {
        if (x < 0.0 || x > 1.0) {
            throw new IllegalArgumentException("x must be between 0.0 and 1.0");
        }
        if (y < 0.0 || y > 1.0) {
            throw new IllegalArgumentException("y must be between 0.0 and 1.0");
        }
    }
}

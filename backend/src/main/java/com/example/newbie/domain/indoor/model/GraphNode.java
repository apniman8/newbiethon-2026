package com.example.newbie.domain.indoor.model;

import java.util.Objects;

public record GraphNode(
        String id,
        NodeType nodeType,
        String floor,
        String mapImageId,
        double imageX,
        double imageY,
        String description,
        String facilityId
) {
    public GraphNode {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(nodeType, "nodeType must not be null");
        Objects.requireNonNull(floor, "floor must not be null");
        Objects.requireNonNull(mapImageId, "mapImageId must not be null");
        Objects.requireNonNull(description, "description must not be null");
        if (imageX < 0.0 || imageX > 1.0) {
            throw new IllegalArgumentException("imageX must be between 0.0 and 1.0");
        }
        if (imageY < 0.0 || imageY > 1.0) {
            throw new IllegalArgumentException("imageY must be between 0.0 and 1.0");
        }
    }
}

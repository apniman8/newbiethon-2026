package com.example.newbie.domain.indoor.model;

import java.util.List;
import java.util.Objects;

public record GraphNode(
        String id,
        NodeType nodeType,
        String floor,
        Double x,
        Double y,
        String description,
        List<Landmark> landmarks,
        String facilityId
) {
    public GraphNode {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(nodeType, "nodeType must not be null");
        Objects.requireNonNull(floor, "floor must not be null");
        Objects.requireNonNull(description, "description must not be null");
        landmarks = landmarks == null ? List.of() : List.copyOf(landmarks);
    }
}

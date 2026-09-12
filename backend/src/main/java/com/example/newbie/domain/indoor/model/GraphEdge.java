package com.example.newbie.domain.indoor.model;

import java.util.Objects;

public record GraphEdge(
        String id,
        String fromNodeId,
        String toNodeId,
        int distanceMeters,
        int baseDurationSeconds,
        MovementType movementType,
        Direction direction,
        String instruction,
        String facilityId,
        boolean accessible
) {
    public GraphEdge {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(fromNodeId, "fromNodeId must not be null");
        Objects.requireNonNull(toNodeId, "toNodeId must not be null");
        Objects.requireNonNull(movementType, "movementType must not be null");
        Objects.requireNonNull(direction, "direction must not be null");
        Objects.requireNonNull(instruction, "instruction must not be null");

        if (distanceMeters < 0) {
            throw new IllegalArgumentException("distanceMeters must not be negative");
        }
        if (baseDurationSeconds < 0) {
            throw new IllegalArgumentException("baseDurationSeconds must not be negative");
        }
    }
}

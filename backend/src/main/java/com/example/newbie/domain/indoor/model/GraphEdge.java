package com.example.newbie.domain.indoor.model;

import java.util.List;

public record GraphEdge(
        String id,
        String fromNodeId,
        String toNodeId,
        int distanceMeters,
        int baseDurationSeconds,
        MovementType movementType,
        String instruction,
        String facilityId,
        boolean accessible,
        List<ImagePoint> geometry
) {
    public GraphEdge {
        id = GraphDataAssertions.requireText(id, "edge.id");
        fromNodeId = GraphDataAssertions.requireText(fromNodeId, "edge.fromNodeId");
        toNodeId = GraphDataAssertions.requireText(toNodeId, "edge.toNodeId");
        distanceMeters = GraphDataAssertions.requireNonNegative(distanceMeters, "edge.distanceMeters");
        baseDurationSeconds = GraphDataAssertions.requireNonNegative(
                baseDurationSeconds,
                "edge.baseDurationSeconds"
        );
        movementType = GraphDataAssertions.requireValue(movementType, "edge.movementType");
        instruction = GraphDataAssertions.requireText(instruction, "edge.instruction");
        geometry = geometry == null ? List.of() : List.copyOf(geometry);
    }
}

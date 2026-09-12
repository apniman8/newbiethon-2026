package com.example.newbie.domain.indoor.model;

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
        id = GraphDataAssertions.requireText(id, "edge.id");
        fromNodeId = GraphDataAssertions.requireText(fromNodeId, "edge.fromNodeId");
        toNodeId = GraphDataAssertions.requireText(toNodeId, "edge.toNodeId");
        distanceMeters = GraphDataAssertions.requireNonNegative(distanceMeters, "edge.distanceMeters");
        baseDurationSeconds = GraphDataAssertions.requireNonNegative(
                baseDurationSeconds,
                "edge.baseDurationSeconds"
        );
        movementType = GraphDataAssertions.requireValue(movementType, "edge.movementType");
        direction = GraphDataAssertions.requireValue(direction, "edge.direction");
        instruction = GraphDataAssertions.requireText(instruction, "edge.instruction");
    }
}

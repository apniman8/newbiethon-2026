package com.example.newbie.domain.indoor.model;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Edges are authored once, in one direction, but DijkstraRouteFinder is
 * allowed to traverse them in reverse too (see {@link #reversed()}). No
 * geometric left/right computation is derived from imageX/imageY for this —
 * both directions carry their own hand-written instruction so the isometric
 * map coordinates never have to double as a compass.
 */
public record GraphEdge(
        String id,
        String fromNodeId,
        String toNodeId,
        int distanceMeters,
        int baseDurationSeconds,
        MovementType movementType,
        String instruction,
        String reverseInstruction,
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
        reverseInstruction = GraphDataAssertions.requireText(reverseInstruction, "edge.reverseInstruction");
        geometry = geometry == null ? List.of() : List.copyOf(geometry);
    }

    /**
     * The same physical corridor, traversed the other way: from/to swapped,
     * instruction/reverseInstruction swapped, geometry point order reversed
     * so it still runs fromNode -> toNode. Same id, distance, movement type,
     * facility, and accessibility — it is the same edge, not a new one.
     */
    public GraphEdge reversed() {
        List<ImagePoint> reversedGeometry = new ArrayList<>(geometry);
        Collections.reverse(reversedGeometry);
        return new GraphEdge(
                id,
                toNodeId,
                fromNodeId,
                distanceMeters,
                baseDurationSeconds,
                movementType,
                reverseInstruction,
                instruction,
                facilityId,
                accessible,
                reversedGeometry
        );
    }
}

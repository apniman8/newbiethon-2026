package com.example.newbie.domain.indoor.model;

import com.example.newbie.domain.indoor.exception.GraphDataInvalidException;

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
        id = GraphDataAssertions.requireText(id, "node.id");
        nodeType = GraphDataAssertions.requireValue(nodeType, "node.nodeType");
        floor = GraphDataAssertions.requireText(floor, "node.floor");
        mapImageId = GraphDataAssertions.requireText(mapImageId, "node.mapImageId");
        description = GraphDataAssertions.requireText(description, "node.description");
        requireNormalized(imageX, "node.imageX");
        requireNormalized(imageY, "node.imageY");
    }

    private static void requireNormalized(double value, String field) {
        if (!Double.isFinite(value) || value < 0.0 || value > 1.0) {
            throw new GraphDataInvalidException(field + " must be between 0.0 and 1.0");
        }
    }
}

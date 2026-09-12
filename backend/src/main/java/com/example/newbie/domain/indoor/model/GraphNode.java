package com.example.newbie.domain.indoor.model;

import java.util.List;

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
        id = GraphDataAssertions.requireText(id, "node.id");
        nodeType = GraphDataAssertions.requireValue(nodeType, "node.nodeType");
        floor = GraphDataAssertions.requireText(floor, "node.floor");
        description = GraphDataAssertions.requireText(description, "node.description");
        landmarks = landmarks == null ? List.of() : List.copyOf(landmarks);
    }
}

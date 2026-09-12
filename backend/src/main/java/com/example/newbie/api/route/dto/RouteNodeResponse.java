package com.example.newbie.api.route.dto;

import com.example.newbie.domain.indoor.model.GraphNode;
import com.example.newbie.domain.indoor.model.NodeType;

public record RouteNodeResponse(
        String id,
        NodeType nodeType,
        String floor,
        double imageX,
        double imageY,
        String description,
        String facilityId
) {
    public static RouteNodeResponse from(GraphNode node) {
        return new RouteNodeResponse(
                node.id(),
                node.nodeType(),
                node.floor(),
                node.imageX(),
                node.imageY(),
                node.description(),
                node.facilityId()
        );
    }
}

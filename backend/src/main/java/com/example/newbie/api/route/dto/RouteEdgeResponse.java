package com.example.newbie.api.route.dto;

import com.example.newbie.domain.indoor.model.GraphEdge;
import com.example.newbie.domain.indoor.model.MovementType;
import java.util.List;

public record RouteEdgeResponse(
        String id,
        String fromNodeId,
        String toNodeId,
        int distanceMeters,
        int baseDurationSeconds,
        MovementType movementType,
        String instruction,
        String facilityId,
        boolean accessible,
        List<ImagePointResponse> geometry
) {
    public static RouteEdgeResponse from(GraphEdge edge) {
        return new RouteEdgeResponse(
                edge.id(),
                edge.fromNodeId(),
                edge.toNodeId(),
                edge.distanceMeters(),
                edge.baseDurationSeconds(),
                edge.movementType(),
                edge.instruction(),
                edge.facilityId(),
                edge.accessible(),
                edge.geometry().stream().map(ImagePointResponse::from).toList()
        );
    }
}

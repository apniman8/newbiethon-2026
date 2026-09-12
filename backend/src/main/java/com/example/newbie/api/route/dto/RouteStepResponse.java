package com.example.newbie.api.route.dto;

import com.example.newbie.domain.indoor.model.Direction;
import com.example.newbie.domain.indoor.model.MovementType;
import com.example.newbie.domain.indoor.model.NodeType;

public record RouteStepResponse(
        int sequence,
        String fromNodeId,
        String toNodeId,
        String fromFloor,
        String toFloor,
        NodeType nodeType,
        MovementType movementType,
        Direction direction,
        int distanceMeters,
        String instruction,
        LandmarkResponse landmark
) {
}

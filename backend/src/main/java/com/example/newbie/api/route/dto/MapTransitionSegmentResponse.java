package com.example.newbie.api.route.dto;

public record MapTransitionSegmentResponse(
        String segmentType,
        int sequence,
        boolean mapTransition,
        String fromMapImageId,
        String toMapImageId,
        String fromNodeId,
        String toNodeId,
        String instruction
) implements RouteSegment {

    public MapTransitionSegmentResponse(
            int sequence,
            String fromMapImageId,
            String toMapImageId,
            String fromNodeId,
            String toNodeId,
            String instruction
    ) {
        this(
                "TRANSITION",
                sequence,
                true,
                fromMapImageId,
                toMapImageId,
                fromNodeId,
                toNodeId,
                instruction
        );
    }
}

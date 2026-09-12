package com.example.newbie.api.route.dto;

public record MapTransitionSegmentResponse(
        int sequence,
        boolean mapTransition,
        String fromMapImageId,
        String toMapImageId,
        String instruction
) implements RouteSegment {

    public MapTransitionSegmentResponse(int sequence, String fromMapImageId, String toMapImageId, String instruction) {
        this(sequence, true, fromMapImageId, toMapImageId, instruction);
    }
}

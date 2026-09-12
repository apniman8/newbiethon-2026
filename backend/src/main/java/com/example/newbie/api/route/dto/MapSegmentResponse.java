package com.example.newbie.api.route.dto;

import java.util.List;

public record MapSegmentResponse(
        String segmentType,
        int sequence,
        String mapImageId,
        String floor,
        List<RouteNodeResponse> nodes,
        List<RouteEdgeResponse> edges
) implements RouteSegment {
    public MapSegmentResponse {
        nodes = nodes == null ? List.of() : List.copyOf(nodes);
        edges = edges == null ? List.of() : List.copyOf(edges);
    }

    public MapSegmentResponse(
            int sequence,
            String mapImageId,
            String floor,
            List<RouteNodeResponse> nodes,
            List<RouteEdgeResponse> edges
    ) {
        this("MAP", sequence, mapImageId, floor, nodes, edges);
    }
}

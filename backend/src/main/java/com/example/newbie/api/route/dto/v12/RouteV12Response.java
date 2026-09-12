package com.example.newbie.api.route.dto.v12;

import com.example.newbie.application.route.RoutePlan;
import com.example.newbie.domain.indoor.model.FacilityDataStatus;
import com.example.newbie.domain.indoor.model.RoutingProfile;
import java.util.List;

public record RouteV12Response(
        String apiVersion,
        String routeId,
        String mapId,
        RoutingProfile profile,
        PlaceResponse start,
        PlaceResponse destination,
        SummaryResponse summary,
        FacilityDataStatus facilityDataStatus,
        List<SegmentResponse> segments
) {
    public RouteV12Response {
        segments = segments == null ? List.of() : List.copyOf(segments);
    }

    public static RouteV12Response from(RoutePlan plan) {
        return new RouteV12Response(
                plan.apiVersion(),
                plan.routeId(),
                plan.mapId(),
                plan.profile(),
                PlaceResponse.from(plan.start()),
                PlaceResponse.from(plan.destination()),
                SummaryResponse.from(plan.summary()),
                plan.facilityDataStatus(),
                plan.segments().stream().map(RouteV12Response::toResponse).toList()
        );
    }

    private static SegmentResponse toResponse(RoutePlan.Segment segment) {
        if (segment instanceof RoutePlan.MapSegment map) {
            return new MapSegmentResponse(
                    "MAP",
                    map.sequence(),
                    map.mapImageId(),
                    map.floor(),
                    map.nodeIds(),
                    map.edgeIds(),
                    map.distanceMeters(),
                    map.estimatedDurationSeconds()
            );
        }
        if (segment instanceof RoutePlan.TransitionSegment transition) {
            return new TransitionSegmentResponse(
                    "TRANSITION",
                    transition.sequence(),
                    true,
                    transition.fromMapImageId(),
                    transition.toMapImageId(),
                    transition.fromNodeId(),
                    transition.toNodeId(),
                    transition.instruction()
            );
        }
        throw new IllegalArgumentException("Unsupported route segment: " + segment.getClass());
    }

    public record PlaceResponse(
            String placeId,
            String nodeId,
            String displayName,
            String floor
    ) {
        private static PlaceResponse from(RoutePlan.Place place) {
            return new PlaceResponse(
                    place.placeId(),
                    place.nodeId(),
                    place.displayName(),
                    place.floor()
            );
        }
    }

    public record SummaryResponse(
            int totalDistanceMeters,
            int estimatedDurationSeconds,
            int segmentCount,
            boolean usesStairs,
            int elevatorCount
    ) {
        private static SummaryResponse from(RoutePlan.Summary summary) {
            return new SummaryResponse(
                    summary.totalDistanceMeters(),
                    summary.estimatedDurationSeconds(),
                    summary.segmentCount(),
                    summary.usesStairs(),
                    summary.elevatorCount()
            );
        }
    }

    public sealed interface SegmentResponse
            permits MapSegmentResponse, TransitionSegmentResponse {
    }

    public record MapSegmentResponse(
            String segmentType,
            int sequence,
            String mapImageId,
            String floor,
            List<String> nodeIds,
            List<String> edgeIds,
            int distanceMeters,
            int estimatedDurationSeconds
    ) implements SegmentResponse {
        public MapSegmentResponse {
            nodeIds = nodeIds == null ? List.of() : List.copyOf(nodeIds);
            edgeIds = edgeIds == null ? List.of() : List.copyOf(edgeIds);
        }
    }

    public record TransitionSegmentResponse(
            String segmentType,
            int sequence,
            boolean mapTransition,
            String fromMapImageId,
            String toMapImageId,
            String fromNodeId,
            String toNodeId,
            String instruction
    ) implements SegmentResponse {
    }
}

package com.example.newbie.application.route;

import com.example.newbie.domain.indoor.model.FacilityDataStatus;
import com.example.newbie.domain.indoor.model.RoutingProfile;
import java.util.List;

public record RoutePlan(
        String apiVersion,
        String routeId,
        String mapId,
        RoutingProfile profile,
        Place start,
        Place destination,
        Summary summary,
        FacilityDataStatus facilityDataStatus,
        List<Segment> segments
) {
    public RoutePlan {
        segments = segments == null ? List.of() : List.copyOf(segments);
    }

    public record Place(
            String placeId,
            String nodeId,
            String displayName,
            String floor
    ) {
    }

    public record Summary(
            int totalDistanceMeters,
            int estimatedDurationSeconds,
            int segmentCount,
            boolean usesStairs,
            int elevatorCount
    ) {
    }

    public sealed interface Segment permits MapSegment, TransitionSegment {

        int sequence();
    }

    public record MapSegment(
            int sequence,
            String mapImageId,
            String floor,
            List<String> nodeIds,
            List<String> edgeIds,
            int distanceMeters,
            int estimatedDurationSeconds
    ) implements Segment {
        public MapSegment {
            nodeIds = nodeIds == null ? List.of() : List.copyOf(nodeIds);
            edgeIds = edgeIds == null ? List.of() : List.copyOf(edgeIds);
        }
    }

    public record TransitionSegment(
            int sequence,
            String fromMapImageId,
            String toMapImageId,
            String fromNodeId,
            String toNodeId,
            String instruction
    ) implements Segment {
    }
}

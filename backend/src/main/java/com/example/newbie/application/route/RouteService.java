package com.example.newbie.application.route;

import com.example.newbie.api.map.dto.MapImageResponse;
import com.example.newbie.api.route.dto.RoutePlaceResponse;
import com.example.newbie.api.route.dto.RouteRequest;
import com.example.newbie.api.route.dto.RouteResponse;
import com.example.newbie.api.route.dto.RouteSegment;
import com.example.newbie.api.route.dto.RouteSummaryResponse;
import com.example.newbie.common.exception.BusinessException;
import com.example.newbie.common.exception.ErrorCode;
import com.example.newbie.domain.indoor.GraphDataException;
import com.example.newbie.domain.indoor.model.Facility;
import com.example.newbie.domain.indoor.model.FacilityStatus;
import com.example.newbie.domain.indoor.model.GraphEdge;
import com.example.newbie.domain.indoor.model.GraphNode;
import com.example.newbie.domain.indoor.model.MovementType;
import com.example.newbie.domain.indoor.model.SelectablePlace;
import com.example.newbie.domain.indoor.model.StationMap;
import com.example.newbie.domain.indoor.repository.GraphRepository;
import com.example.newbie.domain.indoor.routing.PathResult;
import com.example.newbie.domain.indoor.routing.RouteFinder;
import com.example.newbie.domain.indoor.routing.RoutingContext;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class RouteService {

    private static final String API_VERSION = "v1.2";

    private final GraphRepository graphRepository;
    private final PlaceResolver placeResolver;
    private final RouteFinder routeFinder;
    private final RouteSegmentAssembler segmentAssembler;

    public RouteService(
            GraphRepository graphRepository,
            PlaceResolver placeResolver,
            RouteFinder routeFinder,
            RouteSegmentAssembler segmentAssembler
    ) {
        this.graphRepository = graphRepository;
        this.placeResolver = placeResolver;
        this.routeFinder = routeFinder;
        this.segmentAssembler = segmentAssembler;
    }

    public RouteResponse createRoute(RouteRequest request) {
        StationMap map = graphRepository.findById(request.mapId())
                .orElseThrow(() -> new BusinessException(ErrorCode.MAP_NOT_FOUND));

        if (!map.supportedProfiles().contains(request.profile())) {
            throw new BusinessException(ErrorCode.INVALID_PROFILE);
        }

        SelectablePlace startPlace = placeResolver.resolveStart(map, request.startPlaceId());
        SelectablePlace destinationPlace = placeResolver.resolveDestination(map, request.destinationPlaceId());

        GraphNode startNode = requireNode(map, startPlace.nodeId());
        GraphNode destinationNode = requireNode(map, destinationPlace.nodeId());

        RoutingContext context = new RoutingContext(request.profile(), staticFacilityStatuses(map));
        PathResult pathResult = routeFinder.find(map, startNode.id(), destinationNode.id(), context);

        if (pathResult.edges().isEmpty() && !startNode.id().equals(destinationNode.id())) {
            throw new BusinessException(ErrorCode.ROUTE_NOT_FOUND);
        }

        List<RouteSegment> segments = segmentAssembler.assemble(map, startNode, pathResult);

        return new RouteResponse(
                API_VERSION,
                "route-" + UUID.randomUUID(),
                map.mapId(),
                request.profile(),
                toPlaceResponse(startPlace, startNode),
                toPlaceResponse(destinationPlace, destinationNode),
                summarize(pathResult, segments.size()),
                map.facilityDataStatus(),
                map.mapImages().stream().map(MapImageResponse::from).toList(),
                segments
        );
    }

    /**
     * P0 never calls a live facility-status API (see infrastructure/indoor
     * notes) — the map's own seeded Facility.status is the only source of
     * truth. Flipping a facility to OUT_OF_SERVICE in map-v1.json and
     * restarting is the whole "local fixture toggle" demo mechanism; no
     * separate override endpoint is needed for P0.
     */
    private Map<String, FacilityStatus> staticFacilityStatuses(StationMap map) {
        return map.facilities().stream()
                .collect(Collectors.toMap(Facility::id, Facility::status));
    }

    private GraphNode requireNode(StationMap map, String nodeId) {
        return map.nodes().stream()
                .filter(node -> node.id().equals(nodeId))
                .findFirst()
                .orElseThrow(() -> new GraphDataException("Place references unknown node id " + nodeId));
    }

    private RoutePlaceResponse toPlaceResponse(SelectablePlace place, GraphNode node) {
        return new RoutePlaceResponse(place.id(), node.id(), place.displayName(), node.floor());
    }

    private RouteSummaryResponse summarize(PathResult pathResult, int segmentCount) {
        int totalDistanceMeters = pathResult.edges().stream().mapToInt(GraphEdge::distanceMeters).sum();
        boolean usesStairs = pathResult.edges().stream().anyMatch(edge -> edge.movementType() == MovementType.STAIR);
        int elevatorCount = (int) pathResult.edges().stream()
                .filter(edge -> edge.movementType() == MovementType.ELEVATOR)
                .count();

        return new RouteSummaryResponse(
                totalDistanceMeters,
                pathResult.totalCostSeconds(),
                segmentCount,
                usesStairs,
                elevatorCount
        );
    }
}

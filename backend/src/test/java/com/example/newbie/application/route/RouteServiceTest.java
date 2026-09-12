package com.example.newbie.application.route;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.example.newbie.api.route.dto.MapSegmentResponse;
import com.example.newbie.api.route.dto.RouteRequest;
import com.example.newbie.api.route.dto.RouteResponse;
import com.example.newbie.api.route.dto.RouteSegment;
import com.example.newbie.common.exception.BusinessException;
import com.example.newbie.common.exception.ErrorCode;
import com.example.newbie.domain.indoor.model.Facility;
import com.example.newbie.domain.indoor.model.FacilityDataStatus;
import com.example.newbie.domain.indoor.model.FacilityStatus;
import com.example.newbie.domain.indoor.model.FacilityType;
import com.example.newbie.domain.indoor.model.GraphEdge;
import com.example.newbie.domain.indoor.model.GraphNode;
import com.example.newbie.domain.indoor.model.MapImage;
import com.example.newbie.domain.indoor.model.MovementType;
import com.example.newbie.domain.indoor.model.NodeType;
import com.example.newbie.domain.indoor.model.PlaceType;
import com.example.newbie.domain.indoor.model.RoutingProfile;
import com.example.newbie.domain.indoor.model.SelectablePlace;
import com.example.newbie.domain.indoor.model.StationMap;
import com.example.newbie.domain.indoor.repository.GraphRepository;
import com.example.newbie.domain.indoor.routing.DijkstraRouteFinder;
import com.example.newbie.domain.indoor.routing.LuggageRouteCostPolicy;
import com.example.newbie.domain.indoor.routing.StandardRouteCostPolicy;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.Test;

class RouteServiceTest {

    private static final MapImage MAP_IMAGE = new MapImage("MAP-1", "Test map", 100, 100);
    private static final String MAP_ID = "TEST_MAP";

    private final RouteService routeService = new RouteService(
            new StubGraphRepository(),
            new PlaceResolver(),
            new DijkstraRouteFinder(new StandardRouteCostPolicy(), new LuggageRouteCostPolicy()),
            new RouteSegmentAssembler()
    );

    @Test
    void returnsARouteForAValidRequest() {
        RouteResponse response = routeService.createRoute(
                new RouteRequest(MAP_ID, "P-START", "P-END", RoutingProfile.STANDARD)
        );

        assertEquals("N-1", response.start().nodeId());
        assertEquals("N-2", response.destination().nodeId());
        assertEquals(1, response.segments().size());
        MapSegmentResponse segment = assertInstanceOf(MapSegmentResponse.class, response.segments().get(0));
        assertEquals(1, segment.edges().size());
        assertEquals(10, response.summary().totalDistanceMeters());
    }

    @Test
    void throwsMapNotFoundForAnUnknownMap() {
        BusinessException exception = assertThrows(BusinessException.class, () -> routeService.createRoute(
                new RouteRequest("NO_SUCH_MAP", "P-START", "P-END", RoutingProfile.STANDARD)
        ));
        assertEquals(ErrorCode.MAP_NOT_FOUND, exception.getErrorCode());
    }

    @Test
    void throwsInvalidProfileWhenTheMapDoesNotSupportIt() {
        BusinessException exception = assertThrows(BusinessException.class, () -> routeService.createRoute(
                new RouteRequest(MAP_ID, "P-START", "P-END", RoutingProfile.WHEELCHAIR)
        ));
        assertEquals(ErrorCode.INVALID_PROFILE, exception.getErrorCode());
    }

    @Test
    void throwsInvalidPlaceForAnUnknownPlaceId() {
        BusinessException exception = assertThrows(BusinessException.class, () -> routeService.createRoute(
                new RouteRequest(MAP_ID, "NO_SUCH_PLACE", "P-END", RoutingProfile.STANDARD)
        ));
        assertEquals(ErrorCode.INVALID_PLACE, exception.getErrorCode());
    }

    @Test
    void returnsAZeroRouteWhenStartAndDestinationResolveToTheSameNode() {
        RouteResponse response = routeService.createRoute(
                new RouteRequest(MAP_ID, "P-START", "P-START-AS-DESTINATION", RoutingProfile.STANDARD)
        );

        assertEquals(0, response.summary().totalDistanceMeters());
        assertEquals(1, response.segments().size());
        MapSegmentResponse segment = assertInstanceOf(MapSegmentResponse.class, response.segments().get(0));
        assertTrue(segment.edges().isEmpty());
    }

    @Test
    void throwsRouteNotFoundWhenTheOnlyFacilityIsOutOfService() {
        RouteService serviceWithBrokenElevator = new RouteService(
                new StubGraphRepository(FacilityStatus.OUT_OF_SERVICE),
                new PlaceResolver(),
                new DijkstraRouteFinder(new StandardRouteCostPolicy(), new LuggageRouteCostPolicy()),
                new RouteSegmentAssembler()
        );

        BusinessException exception = assertThrows(BusinessException.class, () -> serviceWithBrokenElevator.createRoute(
                new RouteRequest(MAP_ID, "P-START", "P-END", RoutingProfile.STANDARD)
        ));
        assertEquals(ErrorCode.ROUTE_NOT_FOUND, exception.getErrorCode());
    }

    /** Minimal two-node, one-elevator-edge map used across the tests above. */
    private static class StubGraphRepository implements GraphRepository {

        private final StationMap map;

        StubGraphRepository() {
            this(FacilityStatus.AVAILABLE);
        }

        StubGraphRepository(FacilityStatus elevatorStatus) {
            GraphNode start = new GraphNode("N-1", NodeType.PLATFORM_POINT, "1F", MAP_IMAGE.id(), 0.1, 0.1, "Start", null);
            GraphNode end = new GraphNode("N-2", NodeType.DESTINATION, "1F", MAP_IMAGE.id(), 0.2, 0.2, "End", "F-1");
            GraphEdge edge = new GraphEdge("E-1", "N-1", "N-2", 10, 45, MovementType.ELEVATOR, "Take the elevator.", "F-1", true, List.of());
            Facility elevator = new Facility("F-1", FacilityType.ELEVATOR, "Test elevator", null, null, elevatorStatus);

            this.map = new StationMap(
                    MAP_ID, "v1", true, FacilityDataStatus.STATIC,
                    Set.of(RoutingProfile.STANDARD, RoutingProfile.LUGGAGE),
                    List.of(MAP_IMAGE),
                    List.of(
                            new SelectablePlace("P-START", "Start", "Start place", "N-1", PlaceType.ARRIVAL, true, false, 1),
                            new SelectablePlace("P-END", "End", "End place", "N-2", PlaceType.PLATFORM, false, true, 2),
                            new SelectablePlace("P-START-AS-DESTINATION", "Start", "Start place, also selectable as a destination", "N-1", PlaceType.ARRIVAL, false, true, 3)
                    ),
                    List.of(start, end),
                    List.of(edge),
                    List.of(elevator)
            );
        }

        @Override
        public Optional<StationMap> findById(String mapId) {
            return mapId.equals(map.mapId()) ? Optional.of(map) : Optional.empty();
        }
    }
}

package com.example.newbie.domain.indoor.routing;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.example.newbie.domain.indoor.model.Facility;
import com.example.newbie.domain.indoor.model.FacilityDataStatus;
import com.example.newbie.domain.indoor.model.FacilityStatus;
import com.example.newbie.domain.indoor.model.FacilityType;
import com.example.newbie.domain.indoor.model.GraphEdge;
import com.example.newbie.domain.indoor.model.GraphNode;
import com.example.newbie.domain.indoor.model.MapImage;
import com.example.newbie.domain.indoor.model.MovementType;
import com.example.newbie.domain.indoor.model.NodeType;
import com.example.newbie.domain.indoor.model.RoutingProfile;
import com.example.newbie.domain.indoor.model.StationMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.Test;

class DijkstraRouteFinderTest {

    private static final MapImage MAP_IMAGE = new MapImage("MAP-1", "Test map", 100, 100);

    private final DijkstraRouteFinder finder = new DijkstraRouteFinder(
            new StandardRouteCostPolicy(), new LuggageRouteCostPolicy()
    );

    @Test
    void picksTheCheaperOfTwoPaths() {
        StationMap map = stationMap(
                List.of(node("N1"), node("N2"), node("N3")),
                List.of(
                        walk("E-DIRECT", "N1", "N2", 20),
                        walk("E-A", "N1", "N3", 5),
                        walk("E-B", "N3", "N2", 5)
                ),
                List.of()
        );

        PathResult result = finder.find(map, "N1", "N2", standardContext());

        assertEquals(List.of("E-A", "E-B"), edgeIds(result));
        assertEquals(10, result.totalCostSeconds());
    }

    @Test
    void traversesAnAuthoredEdgeBackwardsUsingItsReverseInstruction() {
        StationMap map = stationMap(
                List.of(node("N1"), node("N2")),
                List.of(walk("E-A", "N2", "N1", 5)),
                List.of()
        );

        PathResult result = finder.find(map, "N1", "N2", standardContext());

        assertEquals(1, result.edges().size());
        GraphEdge traversed = result.edges().get(0);
        assertEquals("E-A", traversed.id());
        assertEquals("N1", traversed.fromNodeId());
        assertEquals("N2", traversed.toNodeId());
        assertEquals("Test reverse instruction.", traversed.instruction());
    }

    @Test
    void luggageExcludesStairsEvenWhenCheaper() {
        StationMap map = stationMap(
                List.of(node("N1"), node("N2"), node("N3")),
                List.of(
                        edge("E-STAIR", "N1", "N2", MovementType.STAIR, 5, null),
                        walk("E-A", "N1", "N3", 8),
                        walk("E-B", "N3", "N2", 8)
                ),
                List.of()
        );

        PathResult standardResult = finder.find(map, "N1", "N2", standardContext());
        PathResult luggageResult = finder.find(map, "N1", "N2", luggageContext());

        assertEquals(List.of("E-STAIR"), edgeIds(standardResult));
        assertEquals(List.of("E-A", "E-B"), edgeIds(luggageResult));
    }

    @Test
    void elevatorWaitCostIsAddedOnTopOfBaseDuration() {
        StationMap map = stationMap(
                List.of(node("N1"), node("N2")),
                List.of(edge("E-LIFT", "N1", "N2", MovementType.ELEVATOR, 10, null)),
                List.of()
        );

        PathResult result = finder.find(map, "N1", "N2", standardContext());

        assertEquals(55, result.totalCostSeconds()); // 10 base + 45 fixed wait
    }

    @Test
    void outOfServiceFacilityEdgeIsExcludedWithNoAlternative() {
        Facility elevator = new Facility("F-1", FacilityType.ELEVATOR, "Test elevator", null, null, FacilityStatus.AVAILABLE);
        StationMap map = stationMap(
                List.of(node("N1"), node("N2")),
                List.of(edge("E-LIFT", "N1", "N2", MovementType.ELEVATOR, 10, "F-1")),
                List.of(elevator)
        );

        RoutingContext context = new RoutingContext(RoutingProfile.STANDARD, Map.of("F-1", FacilityStatus.OUT_OF_SERVICE));
        PathResult result = finder.find(map, "N1", "N2", context);

        assertEquals(PathResult.empty(), result);
    }

    @Test
    void outOfServiceFacilityTriggersReroute() {
        Facility elevator = new Facility("F-1", FacilityType.ELEVATOR, "Test elevator", null, null, FacilityStatus.AVAILABLE);
        StationMap map = stationMap(
                List.of(node("N1"), node("N2")),
                List.of(
                        edge("E-LIFT", "N1", "N2", MovementType.ELEVATOR, 10, "F-1"),
                        walk("E-WALK", "N1", "N2", 40)
                ),
                List.of(elevator)
        );

        RoutingContext context = new RoutingContext(RoutingProfile.STANDARD, Map.of("F-1", FacilityStatus.OUT_OF_SERVICE));
        PathResult result = finder.find(map, "N1", "N2", context);

        assertEquals(List.of("E-WALK"), edgeIds(result));
    }

    @Test
    void unreachableDestinationReturnsEmptyPathResult() {
        StationMap map = stationMap(List.of(node("N1"), node("N2")), List.of(), List.of());

        PathResult result = finder.find(map, "N1", "N2", standardContext());

        assertEquals(PathResult.empty(), result);
    }

    @Test
    void sameStartAndDestinationReturnsZeroRouteWithoutSearching() {
        StationMap map = stationMap(List.of(node("N1")), List.of(), List.of());

        PathResult result = finder.find(map, "N1", "N1", standardContext());

        assertEquals(PathResult.empty(), result);
    }

    @Test
    void repeatedCallsOnTheSameGraphReturnTheSameResult() {
        StationMap map = stationMap(
                List.of(node("N1"), node("N2")),
                List.of(walk("E-1", "N1", "N2", 10)),
                List.of()
        );

        PathResult first = finder.find(map, "N1", "N2", standardContext());
        PathResult second = finder.find(map, "N1", "N2", standardContext());

        assertEquals(first, second);
        assertTrue(map.edges().get(0).baseDurationSeconds() == 10); // untouched by routing
    }

    private List<String> edgeIds(PathResult result) {
        return result.edges().stream().map(GraphEdge::id).toList();
    }

    private RoutingContext standardContext() {
        return new RoutingContext(RoutingProfile.STANDARD, Map.of());
    }

    private RoutingContext luggageContext() {
        return new RoutingContext(RoutingProfile.LUGGAGE, Map.of());
    }

    private GraphNode node(String id) {
        return new GraphNode(id, NodeType.INTERSECTION, "1F", MAP_IMAGE.id(), 0.1, 0.1, "Test node", null);
    }

    private GraphEdge walk(String id, String from, String to, int baseDurationSeconds) {
        return edge(id, from, to, MovementType.WALK, baseDurationSeconds, null);
    }

    private GraphEdge edge(String id, String from, String to, MovementType movementType, int baseDurationSeconds, String facilityId) {
        return new GraphEdge(id, from, to, baseDurationSeconds, baseDurationSeconds, movementType, "Test instruction.", "Test reverse instruction.", facilityId, true, List.of());
    }

    private StationMap stationMap(List<GraphNode> nodes, List<GraphEdge> edges, List<Facility> facilities) {
        return new StationMap(
                "TEST_MAP", "v1", true, FacilityDataStatus.STATIC,
                Set.of(RoutingProfile.STANDARD, RoutingProfile.LUGGAGE),
                List.of(MAP_IMAGE), List.of(), nodes, edges, facilities
        );
    }
}

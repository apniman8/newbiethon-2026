package com.example.newbie.infrastructure.indoor;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.example.newbie.domain.indoor.GraphDataException;
import com.example.newbie.domain.indoor.model.FacilityDataStatus;
import com.example.newbie.domain.indoor.model.GraphEdge;
import com.example.newbie.domain.indoor.model.GraphNode;
import com.example.newbie.domain.indoor.model.ImagePoint;
import com.example.newbie.domain.indoor.model.MapImage;
import com.example.newbie.domain.indoor.model.MovementType;
import com.example.newbie.domain.indoor.model.NodeType;
import com.example.newbie.domain.indoor.model.PlaceType;
import com.example.newbie.domain.indoor.model.RoutingProfile;
import com.example.newbie.domain.indoor.model.SelectablePlace;
import com.example.newbie.domain.indoor.model.StationMap;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;

class GraphValidatorTest {

    private final GraphValidator validator = new GraphValidator();

    private static final MapImage MAP_IMAGE = new MapImage("MAP-1", "Test map", 100, 100);

    @Test
    void acceptsAValidConnectedGraph() {
        GraphNode start = node("N-1", 0.1, 0.1);
        GraphNode end = node("N-2", 0.2, 0.2);
        GraphEdge edge = edge("E-1", "N-1", "N-2");

        StationMap map = stationMap(
                List.of(place("P-START", "N-1", true, false), place("P-END", "N-2", false, true)),
                List.of(start, end),
                List.of(edge)
        );

        assertDoesNotThrow(() -> validator.validate(map));
    }

    @Test
    void rejectsDuplicateNodeIds() {
        GraphNode duplicate1 = node("N-1", 0.1, 0.1);
        GraphNode duplicate2 = node("N-1", 0.3, 0.3);

        StationMap map = stationMap(List.of(), List.of(duplicate1, duplicate2), List.of());

        GraphDataException exception = assertThrows(GraphDataException.class, () -> validator.validate(map));
        assertTrue(exception.getMessage().contains("duplicate node id"));
    }

    @Test
    void rejectsDanglingEdgeReference() {
        GraphNode start = node("N-1", 0.1, 0.1);
        GraphEdge danglingEdge = edge("E-1", "N-1", "N-DOES-NOT-EXIST");

        StationMap map = stationMap(List.of(), List.of(start), List.of(danglingEdge));

        GraphDataException exception = assertThrows(GraphDataException.class, () -> validator.validate(map));
        assertTrue(exception.getMessage().contains("unknown toNodeId"));
    }

    @Test
    void rejectsUnreachableDestination() {
        GraphNode start = node("N-1", 0.1, 0.1);
        GraphNode unreachable = node("N-2", 0.2, 0.2);

        StationMap map = stationMap(
                List.of(place("P-START", "N-1", true, false), place("P-END", "N-2", false, true)),
                List.of(start, unreachable),
                List.of()
        );

        GraphDataException exception = assertThrows(GraphDataException.class, () -> validator.validate(map));
        assertTrue(exception.getMessage().contains("no path from start node"));
    }

    @Test
    void rejectsGeometryOnAMapTransitionEdge() {
        GraphNode start = node("N-1", 0.1, 0.1);
        GraphNode end = new GraphNode(
                "N-2", NodeType.INTERSECTION, "1F", "MAP-2", 0.2, 0.2,
                "Other map node", null
        );
        GraphEdge transition = edge("E-1", "N-1", "N-2");
        StationMap map = new StationMap(
                "TEST_MAP", "v1", true, FacilityDataStatus.STATIC,
                Set.of(RoutingProfile.STANDARD),
                List.of(MAP_IMAGE, new MapImage("MAP-2", "Other map", 100, 100)),
                List.of(), List.of(start, end), List.of(transition), List.of()
        );

        GraphDataException exception = assertThrows(GraphDataException.class, () -> validator.validate(map));

        assertTrue(exception.getMessage().contains("transition edge E-1 must have empty geometry"));
    }

    @Test
    void rejectsGeometryThatDoesNotEndAtTheTargetNode() {
        GraphNode start = node("N-1", 0.1, 0.1);
        GraphNode end = node("N-2", 0.3, 0.3);
        GraphEdge edge = edge("E-1", "N-1", "N-2");
        StationMap map = stationMap(List.of(), List.of(start, end), List.of(edge));

        GraphDataException exception = assertThrows(GraphDataException.class, () -> validator.validate(map));

        assertTrue(exception.getMessage().contains("geometry must end at toNode coordinates"));
    }

    private GraphNode node(String id, double x, double y) {
        return new GraphNode(id, NodeType.INTERSECTION, "1F", MAP_IMAGE.id(), x, y, "Test node", null);
    }

    private GraphEdge edge(String id, String from, String to) {
        return new GraphEdge(
                id,
                from,
                to,
                10,
                8,
                MovementType.WALK,
                "Walk.",
                null,
                true,
                List.of(new ImagePoint(0.1, 0.1), new ImagePoint(0.2, 0.2))
        );
    }

    private SelectablePlace place(String id, String nodeId, boolean start, boolean destination) {
        return new SelectablePlace(id, id, id, nodeId, PlaceType.ARRIVAL, start, destination, 1);
    }

    private StationMap stationMap(List<SelectablePlace> places, List<GraphNode> nodes, List<GraphEdge> edges) {
        return new StationMap(
                "TEST_MAP", "v1", true, FacilityDataStatus.STATIC,
                Set.of(RoutingProfile.STANDARD), List.of(MAP_IMAGE), places, nodes, edges, List.of()
        );
    }
}

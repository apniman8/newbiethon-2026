package com.example.newbie.application.route;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.example.newbie.api.route.dto.MapSegmentResponse;
import com.example.newbie.api.route.dto.MapTransitionSegmentResponse;
import com.example.newbie.api.route.dto.RouteSegment;
import com.example.newbie.domain.indoor.model.FacilityDataStatus;
import com.example.newbie.domain.indoor.model.GraphEdge;
import com.example.newbie.domain.indoor.model.GraphNode;
import com.example.newbie.domain.indoor.model.MapImage;
import com.example.newbie.domain.indoor.model.MovementType;
import com.example.newbie.domain.indoor.model.NodeType;
import com.example.newbie.domain.indoor.model.RoutingProfile;
import com.example.newbie.domain.indoor.model.StationMap;
import com.example.newbie.domain.indoor.routing.PathResult;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;

class RouteSegmentAssemblerTest {

    private final RouteSegmentAssembler assembler = new RouteSegmentAssembler();
    private static final MapImage MAP_A = new MapImage("MAP-A", "Map A", 100, 100);
    private static final MapImage MAP_B = new MapImage("MAP-B", "Map B", 100, 100);

    @Test
    void groupsAllEdgesOnOneMapImageIntoASingleSegment() {
        GraphNode n1 = node("N1", MAP_A.id());
        GraphNode n2 = node("N2", MAP_A.id());
        GraphNode n3 = node("N3", MAP_A.id());
        GraphEdge e1 = walk("E1", "N1", "N2");
        GraphEdge e2 = walk("E2", "N2", "N3");

        StationMap map = stationMap(List.of(MAP_A), List.of(n1, n2, n3), List.of(e1, e2));
        PathResult pathResult = new PathResult(List.of(e1, e2), 20);

        List<RouteSegment> segments = assembler.assemble(map, n1, pathResult);

        assertEquals(1, segments.size());
        MapSegmentResponse segment = assertInstanceOf(MapSegmentResponse.class, segments.get(0));
        assertEquals(MAP_A.id(), segment.mapImageId());
        assertEquals(3, segment.nodes().size());
        assertEquals(2, segment.edges().size());
    }

    @Test
    void insertsATransitionSegmentWhenTheMapImageChanges() {
        GraphNode n1 = node("N1", MAP_A.id());
        GraphNode n2 = node("N2", MAP_A.id());
        GraphNode n3 = node("N3", MAP_B.id());
        GraphNode n4 = node("N4", MAP_B.id());
        GraphEdge e1 = walk("E1", "N1", "N2");
        GraphEdge transitionEdge = walk("E-TRANSITION", "N2", "N3");
        GraphEdge e2 = walk("E2", "N3", "N4");

        StationMap map = stationMap(List.of(MAP_A, MAP_B), List.of(n1, n2, n3, n4), List.of(e1, transitionEdge, e2));
        PathResult pathResult = new PathResult(List.of(e1, transitionEdge, e2), 30);

        List<RouteSegment> segments = assembler.assemble(map, n1, pathResult);

        assertEquals(3, segments.size());
        MapSegmentResponse first = assertInstanceOf(MapSegmentResponse.class, segments.get(0));
        MapTransitionSegmentResponse transition = assertInstanceOf(MapTransitionSegmentResponse.class, segments.get(1));
        MapSegmentResponse last = assertInstanceOf(MapSegmentResponse.class, segments.get(2));

        assertEquals(MAP_A.id(), first.mapImageId());
        assertEquals(2, first.nodes().size());
        assertEquals(1, first.edges().size());

        assertTrue(transition.mapTransition());
        assertEquals("TRANSITION", transition.segmentType());
        assertEquals(MAP_A.id(), transition.fromMapImageId());
        assertEquals(MAP_B.id(), transition.toMapImageId());
        assertEquals(n2.id(), transition.fromNodeId());
        assertEquals(n3.id(), transition.toNodeId());

        assertEquals(MAP_B.id(), last.mapImageId());
        assertEquals(2, last.nodes().size());
        assertEquals(1, last.edges().size());
    }

    @Test
    void aZeroEdgeRouteProducesASingleSegmentWithOnlyTheStartNode() {
        GraphNode n1 = node("N1", MAP_A.id());
        StationMap map = stationMap(List.of(MAP_A), List.of(n1), List.of());

        List<RouteSegment> segments = assembler.assemble(map, n1, PathResult.empty());

        assertEquals(1, segments.size());
        MapSegmentResponse segment = assertInstanceOf(MapSegmentResponse.class, segments.get(0));
        assertEquals(1, segment.nodes().size());
        assertEquals(0, segment.edges().size());
    }

    private GraphNode node(String id, String mapImageId) {
        return new GraphNode(id, NodeType.INTERSECTION, "1F", mapImageId, 0.1, 0.1, "Test node", null);
    }

    private GraphEdge walk(String id, String from, String to) {
        return new GraphEdge(id, from, to, 10, 10, MovementType.WALK, "Walk.", "Walk back.", null, true, List.of());
    }

    private StationMap stationMap(List<MapImage> mapImages, List<GraphNode> nodes, List<GraphEdge> edges) {
        return new StationMap(
                "TEST_MAP", "v1", true, FacilityDataStatus.STATIC,
                Set.of(RoutingProfile.STANDARD), mapImages, List.of(), nodes, edges, List.of()
        );
    }
}

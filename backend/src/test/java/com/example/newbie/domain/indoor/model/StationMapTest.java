package com.example.newbie.domain.indoor.model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;

class StationMapTest {

    @Test
    void defensivelyCopiesCollections() {
        List<GraphNode> sourceNodes = new ArrayList<>();
        sourceNodes.add(new GraphNode(
                "N-1", NodeType.INTERSECTION, "1F", null, null,
                "Main corridor", List.of(), null
        ));

        StationMap stationMap = new StationMap(
                "TEST_MAP", "v1", true, FacilityDataStatus.STATIC,
                Set.of(RoutingProfile.STANDARD), List.of(), sourceNodes, List.of(), List.of()
        );

        sourceNodes.clear();

        assertEquals(1, stationMap.nodes().size());
        assertThrows(UnsupportedOperationException.class, () -> stationMap.nodes().clear());
    }
}

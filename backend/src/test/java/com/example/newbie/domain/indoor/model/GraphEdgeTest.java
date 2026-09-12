package com.example.newbie.domain.indoor.model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.example.newbie.domain.indoor.exception.GraphDataInvalidException;
import java.util.List;
import org.junit.jupiter.api.Test;

class GraphEdgeTest {

    @Test
    void rejectsNegativeDistance() {
        assertThrows(GraphDataInvalidException.class, () -> new GraphEdge(
                "E-1", "N-1", "N-2", -1, 10,
                MovementType.WALK, "Go straight.", "Go back.", null, true, List.of()
        ));
    }

    @Test
    void rejectsNegativeDuration() {
        assertThrows(GraphDataInvalidException.class, () -> new GraphEdge(
                "E-1", "N-1", "N-2", 10, -1,
                MovementType.WALK, "Go straight.", "Go back.", null, true, List.of()
        ));
    }

    @Test
    void rejectsBlankIdentifiersAndInstructions() {
        assertThrows(GraphDataInvalidException.class, () -> new GraphEdge(
                " ", "N-1", "N-2", 10, 10,
                MovementType.WALK, "Go straight.", "Go back.", null, true, List.of()
        ));
        assertThrows(GraphDataInvalidException.class, () -> new GraphEdge(
                "E-1", "N-1", "N-2", 10, 10,
                MovementType.WALK, " ", "Go back.", null, true, List.of()
        ));
        assertThrows(GraphDataInvalidException.class, () -> new GraphEdge(
                "E-1", "N-1", "N-2", 10, 10,
                MovementType.WALK, "Go straight.", " ", null, true, List.of()
        ));
    }

    @Test
    void reversedSwapsEndpointsInstructionsAndGeometryOrder() {
        GraphEdge edge = new GraphEdge(
                "E-1", "N-1", "N-2", 10, 8,
                MovementType.WALK, "Go straight.", "Go back.", "F-1", true,
                List.of(new ImagePoint(0.1, 0.1), new ImagePoint(0.2, 0.2))
        );

        GraphEdge reversed = edge.reversed();

        assertEquals("E-1", reversed.id());
        assertEquals("N-2", reversed.fromNodeId());
        assertEquals("N-1", reversed.toNodeId());
        assertEquals("Go back.", reversed.instruction());
        assertEquals("Go straight.", reversed.reverseInstruction());
        assertEquals(List.of(new ImagePoint(0.2, 0.2), new ImagePoint(0.1, 0.1)), reversed.geometry());
        assertEquals(edge.distanceMeters(), reversed.distanceMeters());
        assertEquals(edge.facilityId(), reversed.facilityId());
    }
}

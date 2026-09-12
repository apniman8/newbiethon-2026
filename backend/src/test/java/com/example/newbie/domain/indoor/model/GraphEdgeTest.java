package com.example.newbie.domain.indoor.model;

import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.List;
import org.junit.jupiter.api.Test;

class GraphEdgeTest {

    @Test
    void rejectsNegativeDistance() {
        assertThrows(IllegalArgumentException.class, () -> new GraphEdge(
                "E-1", "N-1", "N-2", -1, 10,
                MovementType.WALK, "Go straight.", null, true, List.of()
        ));
    }

    @Test
    void rejectsNegativeDuration() {
        assertThrows(IllegalArgumentException.class, () -> new GraphEdge(
                "E-1", "N-1", "N-2", 10, -1,
                MovementType.WALK, "Go straight.", null, true, List.of()
        ));
    }
}

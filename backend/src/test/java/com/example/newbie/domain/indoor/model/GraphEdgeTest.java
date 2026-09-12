package com.example.newbie.domain.indoor.model;

import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;

class GraphEdgeTest {

    @Test
    void rejectsNegativeDistance() {
        assertThrows(IllegalArgumentException.class, () -> new GraphEdge(
                "E-1", "N-1", "N-2", -1, 10,
                MovementType.WALK, Direction.STRAIGHT, "Go straight.", null, true
        ));
    }

    @Test
    void rejectsNegativeDuration() {
        assertThrows(IllegalArgumentException.class, () -> new GraphEdge(
                "E-1", "N-1", "N-2", 10, -1,
                MovementType.WALK, Direction.STRAIGHT, "Go straight.", null, true
        ));
    }
}

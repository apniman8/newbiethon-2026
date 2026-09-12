package com.example.newbie.domain.indoor.routing;

import com.example.newbie.domain.indoor.model.GraphEdge;
import java.util.List;

public record PathResult(List<GraphEdge> edges, int totalCostSeconds) {
    public PathResult {
        edges = edges == null ? List.of() : List.copyOf(edges);
        if (totalCostSeconds < 0) {
            throw new IllegalArgumentException("totalCostSeconds must not be negative");
        }
    }

    public static PathResult empty() {
        return new PathResult(List.of(), 0);
    }
}

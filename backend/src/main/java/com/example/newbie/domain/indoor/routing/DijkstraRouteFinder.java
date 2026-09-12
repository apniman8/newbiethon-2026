package com.example.newbie.domain.indoor.routing;

import com.example.newbie.domain.indoor.model.GraphEdge;
import com.example.newbie.domain.indoor.model.RoutingProfile;
import com.example.newbie.domain.indoor.model.StationMap;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Deque;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.PriorityQueue;
import org.springframework.stereotype.Component;

/**
 * Standard Dijkstra over the station graph. Never mutates the StationMap or
 * its edges — all profile-specific allow/cost decisions come from the
 * RouteCostPolicy passed in via the RoutingContext's profile, so concurrent
 * requests for different profiles never interfere with each other.
 */
@Component
public class DijkstraRouteFinder implements RouteFinder {

    private final StandardRouteCostPolicy standardRouteCostPolicy;
    private final LuggageRouteCostPolicy luggageRouteCostPolicy;

    public DijkstraRouteFinder(
            StandardRouteCostPolicy standardRouteCostPolicy,
            LuggageRouteCostPolicy luggageRouteCostPolicy
    ) {
        this.standardRouteCostPolicy = standardRouteCostPolicy;
        this.luggageRouteCostPolicy = luggageRouteCostPolicy;
    }

    @Override
    public PathResult find(
            StationMap stationMap,
            String startNodeId,
            String destinationNodeId,
            RoutingContext context
    ) {
        if (Objects.equals(startNodeId, destinationNodeId)) {
            return PathResult.empty();
        }

        RouteCostPolicy costPolicy = resolvePolicy(context.profile());
        Map<String, List<GraphEdge>> outgoingEdges = groupByFromNode(stationMap.edges());

        Map<String, Integer> bestCost = new HashMap<>();
        Map<String, GraphEdge> predecessorEdge = new HashMap<>();
        PriorityQueue<NodeCost> queue = new PriorityQueue<>(Comparator.comparingInt(NodeCost::cost));

        bestCost.put(startNodeId, 0);
        queue.add(new NodeCost(startNodeId, 0));

        while (!queue.isEmpty()) {
            NodeCost current = queue.poll();
            if (current.cost() > bestCost.getOrDefault(current.nodeId(), Integer.MAX_VALUE)) {
                continue; // stale entry superseded by a cheaper one already processed
            }
            if (current.nodeId().equals(destinationNodeId)) {
                break;
            }

            for (GraphEdge edge : outgoingEdges.getOrDefault(current.nodeId(), List.of())) {
                if (!costPolicy.isAllowed(edge, context)) {
                    continue;
                }
                int candidateCost = current.cost() + costPolicy.calculateCost(edge, context);
                if (candidateCost < bestCost.getOrDefault(edge.toNodeId(), Integer.MAX_VALUE)) {
                    bestCost.put(edge.toNodeId(), candidateCost);
                    predecessorEdge.put(edge.toNodeId(), edge);
                    queue.add(new NodeCost(edge.toNodeId(), candidateCost));
                }
            }
        }

        if (!bestCost.containsKey(destinationNodeId)) {
            return PathResult.empty();
        }

        return new PathResult(reconstructPath(destinationNodeId, predecessorEdge), bestCost.get(destinationNodeId));
    }

    private Map<String, List<GraphEdge>> groupByFromNode(List<GraphEdge> edges) {
        Map<String, List<GraphEdge>> outgoingEdges = new HashMap<>();
        for (GraphEdge edge : edges) {
            outgoingEdges.computeIfAbsent(edge.fromNodeId(), key -> new ArrayList<>()).add(edge);
        }
        return outgoingEdges;
    }

    private List<GraphEdge> reconstructPath(String destinationNodeId, Map<String, GraphEdge> predecessorEdge) {
        Deque<GraphEdge> path = new ArrayDeque<>();
        String cursor = destinationNodeId;
        while (predecessorEdge.containsKey(cursor)) {
            GraphEdge edge = predecessorEdge.get(cursor);
            path.addFirst(edge);
            cursor = edge.fromNodeId();
        }
        return List.copyOf(path);
    }

    private RouteCostPolicy resolvePolicy(RoutingProfile profile) {
        return switch (profile) {
            case STANDARD -> standardRouteCostPolicy;
            case LUGGAGE -> luggageRouteCostPolicy;
            case WHEELCHAIR -> throw new IllegalArgumentException(
                    "WHEELCHAIR routing is not implemented yet (P1)."
            );
        };
    }

    private record NodeCost(String nodeId, int cost) {
    }
}

package com.example.newbie.infrastructure.indoor;

import com.example.newbie.domain.indoor.GraphDataException;
import com.example.newbie.domain.indoor.model.Facility;
import com.example.newbie.domain.indoor.model.GraphEdge;
import com.example.newbie.domain.indoor.model.GraphNode;
import com.example.newbie.domain.indoor.model.ImagePoint;
import com.example.newbie.domain.indoor.model.MapImage;
import com.example.newbie.domain.indoor.model.SelectablePlace;
import com.example.newbie.domain.indoor.model.StationMap;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Queue;
import java.util.Set;
import org.springframework.stereotype.Component;

/**
 * Validates a freshly loaded StationMap before it is allowed into the
 * running repository. Collects every problem it finds rather than failing
 * on the first one, so a bad seed file can be fixed in one pass.
 */
@Component
public class GraphValidator {

    private static final double COORDINATE_TOLERANCE = 0.000_001;

    public void validate(StationMap map) {
        List<String> errors = new ArrayList<>();

        Set<String> nodeIds = uniqueIds(map.nodes().stream().map(GraphNode::id).toList(), "node", errors);
        uniqueIds(map.edges().stream().map(GraphEdge::id).toList(), "edge", errors);
        Set<String> facilityIds = uniqueIds(map.facilities().stream().map(Facility::id).toList(), "facility", errors);
        uniqueIds(map.places().stream().map(SelectablePlace::id).toList(), "place", errors);
        Set<String> mapImageIds = uniqueIds(map.mapImages().stream().map(MapImage::id).toList(), "mapImage", errors);
        Map<String, GraphNode> nodesById = map.nodes().stream()
                .collect(HashMap::new, (nodes, node) -> nodes.putIfAbsent(node.id(), node), HashMap::putAll);

        for (GraphNode node : map.nodes()) {
            if (!mapImageIds.contains(node.mapImageId())) {
                errors.add("node " + node.id() + " references unknown mapImageId " + node.mapImageId());
            }
            if (node.facilityId() != null && !facilityIds.contains(node.facilityId())) {
                errors.add("node " + node.id() + " references unknown facilityId " + node.facilityId());
            }
        }

        for (GraphEdge edge : map.edges()) {
            if (!nodeIds.contains(edge.fromNodeId())) {
                errors.add("edge " + edge.id() + " references unknown fromNodeId " + edge.fromNodeId());
            }
            if (!nodeIds.contains(edge.toNodeId())) {
                errors.add("edge " + edge.id() + " references unknown toNodeId " + edge.toNodeId());
            }
            if (edge.facilityId() != null && !facilityIds.contains(edge.facilityId())) {
                errors.add("edge " + edge.id() + " references unknown facilityId " + edge.facilityId());
            }
            validateGeometry(edge, nodesById, errors);
        }

        for (SelectablePlace place : map.places()) {
            if (!nodeIds.contains(place.nodeId())) {
                errors.add("place " + place.id() + " references unknown nodeId " + place.nodeId());
            }
        }

        if (errors.isEmpty()) {
            errors.addAll(checkConnectivity(map));
        }

        if (!errors.isEmpty()) {
            throw new GraphDataException(errors);
        }
    }

    private void validateGeometry(
            GraphEdge edge,
            Map<String, GraphNode> nodesById,
            List<String> errors
    ) {
        GraphNode fromNode = nodesById.get(edge.fromNodeId());
        GraphNode toNode = nodesById.get(edge.toNodeId());
        if (fromNode == null || toNode == null) {
            return;
        }

        boolean mapTransition = !fromNode.mapImageId().equals(toNode.mapImageId());
        if (mapTransition) {
            if (!edge.geometry().isEmpty()) {
                errors.add("transition edge " + edge.id() + " must have empty geometry");
            }
            return;
        }

        if (edge.geometry().isEmpty()) {
            errors.add("same-map edge " + edge.id() + " must have geometry");
            return;
        }

        ImagePoint first = edge.geometry().get(0);
        ImagePoint last = edge.geometry().get(edge.geometry().size() - 1);
        if (!matches(first, fromNode)) {
            errors.add("edge " + edge.id() + " geometry must start at fromNode coordinates");
        }
        if (!matches(last, toNode)) {
            errors.add("edge " + edge.id() + " geometry must end at toNode coordinates");
        }
    }

    private boolean matches(ImagePoint point, GraphNode node) {
        return Math.abs(point.x() - node.imageX()) <= COORDINATE_TOLERANCE
                && Math.abs(point.y() - node.imageY()) <= COORDINATE_TOLERANCE;
    }

    private Set<String> uniqueIds(List<String> ids, String label, List<String> errors) {
        Set<String> seen = new HashSet<>();
        for (String id : ids) {
            if (!seen.add(id)) {
                errors.add("duplicate " + label + " id: " + id);
            }
        }
        return seen;
    }

    /**
     * Phase 2 only checks that a path exists at all (ignoring profile
     * movement rules) — the profile-aware reachability check belongs to
     * Dijkstra + RouteCostPolicy in Phase 3.
     */
    private List<String> checkConnectivity(StationMap map) {
        List<String> errors = new ArrayList<>();
        Map<String, List<String>> adjacency = new HashMap<>();
        for (GraphEdge edge : map.edges()) {
            adjacency.computeIfAbsent(edge.fromNodeId(), key -> new ArrayList<>()).add(edge.toNodeId());
        }

        List<String> startNodeIds = map.places().stream()
                .filter(SelectablePlace::selectableAsStart)
                .map(SelectablePlace::nodeId)
                .toList();
        List<String> destinationNodeIds = map.places().stream()
                .filter(SelectablePlace::selectableAsDestination)
                .map(SelectablePlace::nodeId)
                .toList();

        for (String startNodeId : startNodeIds) {
            Set<String> reachable = reachableFrom(startNodeId, adjacency);
            for (String destinationNodeId : destinationNodeIds) {
                if (!reachable.contains(destinationNodeId)) {
                    errors.add("no path from start node " + startNodeId + " to destination node " + destinationNodeId);
                }
            }
        }
        return errors;
    }

    private Set<String> reachableFrom(String startNodeId, Map<String, List<String>> adjacency) {
        Set<String> visited = new HashSet<>();
        Queue<String> queue = new ArrayDeque<>();
        visited.add(startNodeId);
        queue.add(startNodeId);
        while (!queue.isEmpty()) {
            String current = queue.poll();
            for (String next : adjacency.getOrDefault(current, List.of())) {
                if (visited.add(next)) {
                    queue.add(next);
                }
            }
        }
        return visited;
    }
}

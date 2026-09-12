package com.example.newbie.application.route;

import com.example.newbie.api.route.dto.MapSegmentResponse;
import com.example.newbie.api.route.dto.MapTransitionSegmentResponse;
import com.example.newbie.api.route.dto.RouteEdgeResponse;
import com.example.newbie.api.route.dto.RouteNodeResponse;
import com.example.newbie.api.route.dto.RouteSegment;
import com.example.newbie.domain.indoor.GraphDataException;
import com.example.newbie.domain.indoor.model.GraphEdge;
import com.example.newbie.domain.indoor.model.GraphNode;
import com.example.newbie.domain.indoor.model.StationMap;
import com.example.newbie.domain.indoor.routing.PathResult;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

/**
 * Groups a Dijkstra path into per-map-image segments. Whenever consecutive
 * nodes live on different map images, a MapTransitionSegmentResponse is
 * inserted instead of drawing a line — the frontend shows a handoff card
 * there instead of geometry. Every visited node appears in exactly one
 * MapSegmentResponse.
 */
@Component
public class RouteSegmentAssembler {

    public List<RouteSegment> assemble(StationMap map, GraphNode startNode, PathResult pathResult) {
        Map<String, GraphNode> nodesById = map.nodes().stream()
                .collect(Collectors.toMap(GraphNode::id, Function.identity()));

        List<RouteSegment> segments = new ArrayList<>();
        int sequence = 1;

        List<GraphNode> currentNodes = new ArrayList<>(List.of(startNode));
        List<GraphEdge> currentEdges = new ArrayList<>();
        String currentMapImageId = startNode.mapImageId();

        for (GraphEdge edge : pathResult.edges()) {
            GraphNode fromNode = requireNode(nodesById, edge.fromNodeId());
            GraphNode toNode = requireNode(nodesById, edge.toNodeId());

            if (fromNode.mapImageId().equals(toNode.mapImageId())) {
                currentEdges.add(edge);
                currentNodes.add(toNode);
                continue;
            }

            segments.add(toMapSegment(sequence++, currentMapImageId, currentNodes, currentEdges));
            segments.add(new MapTransitionSegmentResponse(
                    sequence++,
                    fromNode.mapImageId(),
                    toNode.mapImageId(),
                    fromNode.id(),
                    toNode.id(),
                    edge.instruction()
            ));

            currentNodes = new ArrayList<>(List.of(toNode));
            currentEdges = new ArrayList<>();
            currentMapImageId = toNode.mapImageId();
        }

        segments.add(toMapSegment(sequence, currentMapImageId, currentNodes, currentEdges));
        return List.copyOf(segments);
    }

    private MapSegmentResponse toMapSegment(
            int sequence, String mapImageId, List<GraphNode> nodes, List<GraphEdge> edges
    ) {
        return new MapSegmentResponse(
                sequence,
                mapImageId,
                nodes.get(0).floor(),
                nodes.stream().map(RouteNodeResponse::from).toList(),
                edges.stream().map(RouteEdgeResponse::from).toList()
        );
    }

    private GraphNode requireNode(Map<String, GraphNode> nodesById, String nodeId) {
        GraphNode node = nodesById.get(nodeId);
        if (node == null) {
            throw new GraphDataException("Route references unknown node id " + nodeId);
        }
        return node;
    }
}

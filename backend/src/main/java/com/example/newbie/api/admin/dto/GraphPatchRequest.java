package com.example.newbie.api.admin.dto;

import java.util.List;

/** Body of PATCH /api/v1/admin/maps/{mapId}/graph — from NodeEditorScreen's "changed nodes/edges" diff. */
public record GraphPatchRequest(
        List<NodePatchRequest> nodes,
        List<EdgeGeometryPatchRequest> edges
) {
    public GraphPatchRequest {
        nodes = nodes == null ? List.of() : List.copyOf(nodes);
        edges = edges == null ? List.of() : List.copyOf(edges);
    }
}

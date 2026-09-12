package com.example.newbie.api.admin.dto;

public record GraphPatchResponse(
        String message,
        int nodesUpdated,
        int edgesUpdated,
        boolean restartRequired
) {
}

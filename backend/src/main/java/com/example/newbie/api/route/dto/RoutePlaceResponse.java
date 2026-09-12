package com.example.newbie.api.route.dto;

public record RoutePlaceResponse(
        String placeId,
        String nodeId,
        String displayName,
        String floor
) {
}

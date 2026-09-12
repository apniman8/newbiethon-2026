package com.example.newbie.api.route.dto;

public record RouteSummaryResponse(
        int totalDistanceMeters,
        int estimatedDurationSeconds,
        int stepCount,
        boolean usesStairs,
        int elevatorCount
) {
}

package com.example.newbie.api.route.dto;

import com.example.newbie.domain.indoor.model.RoutingProfile;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record RouteRequest(
        @NotBlank(message = "Map is required.")
        String mapId,

        @NotBlank(message = "Start place is required.")
        String startPlaceId,

        @NotBlank(message = "Destination place is required.")
        String destinationPlaceId,

        @NotNull(message = "Travel profile is required.")
        RoutingProfile profile
) {
}

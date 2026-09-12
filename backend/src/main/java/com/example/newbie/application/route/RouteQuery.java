package com.example.newbie.application.route;

import com.example.newbie.domain.indoor.model.RoutingProfile;

public record RouteQuery(
        String mapId,
        String startPlaceId,
        String destinationPlaceId,
        RoutingProfile profile
) {
}

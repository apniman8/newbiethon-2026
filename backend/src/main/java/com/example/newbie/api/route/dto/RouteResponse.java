package com.example.newbie.api.route.dto;

import com.example.newbie.domain.indoor.model.FacilityDataStatus;
import com.example.newbie.domain.indoor.model.RoutingProfile;
import java.util.List;

public record RouteResponse(
        String apiVersion,
        String routeId,
        String mapId,
        RoutingProfile profile,
        RoutePlaceResponse start,
        RoutePlaceResponse destination,
        RouteSummaryResponse summary,
        FacilityDataStatus facilityDataStatus,
        List<RouteStepResponse> steps
) {
    public RouteResponse {
        steps = steps == null ? List.of() : List.copyOf(steps);
    }
}

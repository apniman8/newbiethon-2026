package com.example.newbie.api.route.dto;

import com.example.newbie.api.map.dto.MapImageResponse;
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
        List<MapImageResponse> mapImages,
        List<RouteSegment> segments
) {
    public RouteResponse {
        mapImages = mapImages == null ? List.of() : List.copyOf(mapImages);
        segments = segments == null ? List.of() : List.copyOf(segments);
    }
}

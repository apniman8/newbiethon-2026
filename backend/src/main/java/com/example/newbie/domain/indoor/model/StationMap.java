package com.example.newbie.domain.indoor.model;

import java.util.List;
import java.util.Set;

public record StationMap(
        String mapId,
        String version,
        boolean demoData,
        FacilityDataStatus facilityDataStatus,
        Set<RoutingProfile> supportedProfiles,
        List<MapImage> mapImages,
        List<SelectablePlace> places,
        List<GraphNode> nodes,
        List<GraphEdge> edges,
        List<Facility> facilities
) {
    public StationMap {
        mapId = GraphDataAssertions.requireText(mapId, "map.mapId");
        version = GraphDataAssertions.requireText(version, "map.version");
        facilityDataStatus = GraphDataAssertions.requireValue(
                facilityDataStatus,
                "map.facilityDataStatus"
        );
        supportedProfiles = supportedProfiles == null ? Set.of() : Set.copyOf(supportedProfiles);
        mapImages = mapImages == null ? List.of() : List.copyOf(mapImages);
        places = places == null ? List.of() : List.copyOf(places);
        nodes = nodes == null ? List.of() : List.copyOf(nodes);
        edges = edges == null ? List.of() : List.copyOf(edges);
        facilities = facilities == null ? List.of() : List.copyOf(facilities);
    }
}

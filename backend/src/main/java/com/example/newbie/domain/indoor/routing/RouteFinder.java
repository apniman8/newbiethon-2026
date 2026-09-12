package com.example.newbie.domain.indoor.routing;

import com.example.newbie.domain.indoor.model.StationMap;

public interface RouteFinder {

    PathResult find(
            StationMap stationMap,
            String startNodeId,
            String destinationNodeId,
            RoutingContext context
    );
}

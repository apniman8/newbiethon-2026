package com.example.newbie.domain.indoor.routing;

import com.example.newbie.domain.indoor.model.GraphEdge;

public interface RouteCostPolicy {

    boolean isAllowed(GraphEdge edge, RoutingContext context);

    int calculateCost(GraphEdge edge, RoutingContext context);
}

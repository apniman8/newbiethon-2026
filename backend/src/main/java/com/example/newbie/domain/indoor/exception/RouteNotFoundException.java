package com.example.newbie.domain.indoor.exception;

public class RouteNotFoundException extends RuntimeException {

    public RouteNotFoundException(String startNodeId, String destinationNodeId) {
        super("No route from '%s' to '%s'.".formatted(startNodeId, destinationNodeId));
    }
}

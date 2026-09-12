package com.example.newbie.domain.indoor.model;

import com.example.newbie.domain.indoor.exception.GraphDataInvalidException;

public record SelectablePlace(
        String id,
        String displayName,
        String description,
        String nodeId,
        PlaceType placeType,
        boolean selectableAsStart,
        boolean selectableAsDestination,
        int sortOrder
) {
    public SelectablePlace {
        id = GraphDataAssertions.requireText(id, "place.id");
        displayName = GraphDataAssertions.requireText(displayName, "place.displayName");
        description = GraphDataAssertions.requireText(description, "place.description");
        nodeId = GraphDataAssertions.requireText(nodeId, "place.nodeId");
        placeType = GraphDataAssertions.requireValue(placeType, "place.placeType");
        sortOrder = GraphDataAssertions.requireNonNegative(sortOrder, "place.sortOrder");

        if (!selectableAsStart && !selectableAsDestination) {
            throw new GraphDataInvalidException(
                    "Place '%s' must be selectable as a start or destination.".formatted(id)
            );
        }
    }
}

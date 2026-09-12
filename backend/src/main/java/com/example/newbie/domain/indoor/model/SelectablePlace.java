package com.example.newbie.domain.indoor.model;

import java.util.Objects;

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
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(displayName, "displayName must not be null");
        Objects.requireNonNull(description, "description must not be null");
        Objects.requireNonNull(nodeId, "nodeId must not be null");
        Objects.requireNonNull(placeType, "placeType must not be null");
    }
}

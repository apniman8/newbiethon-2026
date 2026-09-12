package com.example.newbie.api.map.dto;

import com.example.newbie.domain.indoor.model.PlaceType;
import com.example.newbie.domain.indoor.model.SelectablePlace;

public record PlaceResponse(
        String id,
        String displayName,
        String description,
        PlaceType placeType,
        boolean selectableAsStart,
        boolean selectableAsDestination
) {
    public static PlaceResponse from(SelectablePlace place) {
        return new PlaceResponse(
                place.id(),
                place.displayName(),
                place.description(),
                place.placeType(),
                place.selectableAsStart(),
                place.selectableAsDestination()
        );
    }
}

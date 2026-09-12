package com.example.newbie.api.map.dto;

import java.util.List;

public record PlacesResponse(String mapId, List<PlaceResponse> places) {
    public PlacesResponse {
        places = places == null ? List.of() : List.copyOf(places);
    }
}

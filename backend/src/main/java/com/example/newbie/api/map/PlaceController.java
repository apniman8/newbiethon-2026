package com.example.newbie.api.map;

import com.example.newbie.api.map.dto.PlacesResponse;
import com.example.newbie.application.map.MapService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PlaceController {

    private final MapService mapService;

    public PlaceController(MapService mapService) {
        this.mapService = mapService;
    }

    @GetMapping("/api/v1/maps/{mapId}/places")
    public PlacesResponse getPlaces(@PathVariable String mapId) {
        return mapService.getPlaces(mapId);
    }
}

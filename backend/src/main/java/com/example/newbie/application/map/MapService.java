package com.example.newbie.application.map;

import com.example.newbie.api.map.dto.PlaceResponse;
import com.example.newbie.api.map.dto.PlacesResponse;
import com.example.newbie.common.exception.BusinessException;
import com.example.newbie.common.exception.ErrorCode;
import com.example.newbie.domain.indoor.model.StationMap;
import com.example.newbie.domain.indoor.repository.GraphRepository;
import org.springframework.stereotype.Service;

@Service
public class MapService {

    private final GraphRepository graphRepository;

    public MapService(GraphRepository graphRepository) {
        this.graphRepository = graphRepository;
    }

    public PlacesResponse getPlaces(String mapId) {
        StationMap map = graphRepository.findById(mapId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MAP_NOT_FOUND));

        return new PlacesResponse(
                map.mapId(),
                map.places().stream().map(PlaceResponse::from).toList()
        );
    }
}

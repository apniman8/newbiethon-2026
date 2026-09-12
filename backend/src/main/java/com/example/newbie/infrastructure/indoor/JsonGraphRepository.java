package com.example.newbie.infrastructure.indoor;

import com.example.newbie.domain.indoor.model.StationMap;
import com.example.newbie.domain.indoor.repository.GraphRepository;
import java.util.Map;
import java.util.Optional;
import org.springframework.stereotype.Repository;

/**
 * Loads and validates the station map exactly once at startup, then serves
 * it from memory. The graph is immutable for the lifetime of the app —
 * there is no reload/refresh path in P0.
 */
@Repository
public class JsonGraphRepository implements GraphRepository {

    private final Map<String, StationMap> stationMapsById;

    public JsonGraphRepository(GraphProperties properties, GraphJsonLoader loader, GraphValidator validator) {
        StationMap stationMap = loader.load(properties.location());
        validator.validate(stationMap);
        this.stationMapsById = Map.of(stationMap.mapId(), stationMap);
    }

    @Override
    public Optional<StationMap> findById(String mapId) {
        return Optional.ofNullable(stationMapsById.get(mapId));
    }
}

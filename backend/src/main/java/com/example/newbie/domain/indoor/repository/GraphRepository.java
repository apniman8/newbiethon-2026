package com.example.newbie.domain.indoor.repository;

import com.example.newbie.domain.indoor.model.StationMap;
import java.util.Optional;

public interface GraphRepository {

    Optional<StationMap> findById(String mapId);
}

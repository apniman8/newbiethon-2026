package com.example.newbie.domain.indoor.model;

import java.util.List;
import java.util.Objects;

public record Landmark(
        String id,
        LandmarkType type,
        String name,
        String description,
        LandmarkPosition position,
        List<String> aliases
) {
    public Landmark {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(type, "type must not be null");
        Objects.requireNonNull(name, "name must not be null");
        Objects.requireNonNull(description, "description must not be null");
        Objects.requireNonNull(position, "position must not be null");
        aliases = aliases == null ? List.of() : List.copyOf(aliases);
    }
}

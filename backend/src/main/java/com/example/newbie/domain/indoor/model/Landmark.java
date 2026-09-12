package com.example.newbie.domain.indoor.model;

import java.util.List;

public record Landmark(
        String id,
        LandmarkType type,
        String name,
        String description,
        LandmarkPosition position,
        List<String> aliases
) {
    public Landmark {
        id = GraphDataAssertions.requireText(id, "landmark.id");
        type = GraphDataAssertions.requireValue(type, "landmark.type");
        name = GraphDataAssertions.requireText(name, "landmark.name");
        description = GraphDataAssertions.requireText(description, "landmark.description");
        position = GraphDataAssertions.requireValue(position, "landmark.position");
        aliases = aliases == null ? List.of() : List.copyOf(aliases);
    }
}

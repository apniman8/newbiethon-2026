package com.example.newbie.domain.indoor.model;

import java.util.Objects;

public record Facility(
        String id,
        FacilityType type,
        String internalName,
        String externalSource,
        String externalId,
        FacilityStatus status
) {
    public Facility {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(type, "type must not be null");
        Objects.requireNonNull(internalName, "internalName must not be null");
        Objects.requireNonNull(status, "status must not be null");
    }
}

package com.example.newbie.domain.indoor.model;

public record Facility(
        String id,
        FacilityType type,
        String internalName,
        String externalSource,
        String externalId,
        FacilityStatus status
) {
    public Facility {
        id = GraphDataAssertions.requireText(id, "facility.id");
        type = GraphDataAssertions.requireValue(type, "facility.type");
        internalName = GraphDataAssertions.requireText(internalName, "facility.internalName");
        status = GraphDataAssertions.requireValue(status, "facility.status");
    }
}

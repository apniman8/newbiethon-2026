package com.example.newbie.domain.indoor.routing;

import com.example.newbie.domain.indoor.model.FacilityStatus;
import com.example.newbie.domain.indoor.model.RoutingProfile;
import java.util.Map;
import java.util.Objects;

public record RoutingContext(
        RoutingProfile profile,
        Map<String, FacilityStatus> facilityStatuses
) {
    public RoutingContext {
        Objects.requireNonNull(profile, "profile must not be null");
        facilityStatuses = facilityStatuses == null ? Map.of() : Map.copyOf(facilityStatuses);
    }

    public FacilityStatus facilityStatus(String facilityId) {
        return facilityStatuses.getOrDefault(facilityId, FacilityStatus.UNKNOWN);
    }
}

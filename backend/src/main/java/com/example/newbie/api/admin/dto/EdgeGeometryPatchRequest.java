package com.example.newbie.api.admin.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public record EdgeGeometryPatchRequest(
        @NotBlank String id,
        List<ImagePointPatch> geometry
) {
    public EdgeGeometryPatchRequest {
        geometry = geometry == null ? List.of() : List.copyOf(geometry);
    }
}

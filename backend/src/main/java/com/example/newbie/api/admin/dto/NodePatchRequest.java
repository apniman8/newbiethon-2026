package com.example.newbie.api.admin.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;

public record NodePatchRequest(
        @NotBlank String id,
        @DecimalMin("0.0") @DecimalMax("1.0") double imageX,
        @DecimalMin("0.0") @DecimalMax("1.0") double imageY
) {
}

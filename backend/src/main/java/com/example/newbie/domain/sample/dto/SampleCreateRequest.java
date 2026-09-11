package com.example.newbie.domain.sample.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SampleCreateRequest(
        @Schema(description = "제목", example = "해커톤 준비")
        @NotBlank(message = "제목은 필수입니다.")
        @Size(max = 100, message = "제목은 100자 이하여야 합니다.")
        String title,

        @Schema(description = "내용", example = "Swagger와 CRUD를 준비합니다.")
        @Size(max = 5000, message = "내용은 5000자 이하여야 합니다.")
        String content
) {
}

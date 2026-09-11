package com.example.newbie.domain.sample.dto;

import com.example.newbie.domain.sample.Sample;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

public record SampleResponse(
        @Schema(description = "Sample ID", example = "1")
        Long id,

        @Schema(description = "제목", example = "해커톤 준비")
        String title,

        @Schema(description = "내용", example = "Swagger와 CRUD를 준비합니다.")
        String content,

        @Schema(description = "생성 시각", example = "2026-09-11T15:00:00")
        LocalDateTime createdAt,

        @Schema(description = "마지막 수정 시각", example = "2026-09-11T16:00:00")
        LocalDateTime updatedAt
) {

    public static SampleResponse from(Sample sample) {
        return new SampleResponse(
                sample.getId(),
                sample.getTitle(),
                sample.getContent(),
                sample.getCreatedAt(),
                sample.getUpdatedAt()
        );
    }
}

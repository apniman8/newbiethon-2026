package com.example.newbie.domain.sample.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record SampleUpdateRequest(
        @Schema(description = "변경할 제목", example = "해커톤 준비 완료")
        @Pattern(regexp = ".*\\S.*", message = "제목은 공백일 수 없습니다.")
        @Size(max = 100, message = "제목은 100자 이하여야 합니다.")
        String title,

        @Schema(description = "변경할 내용", example = "배포 준비까지 완료했습니다.")
        @Size(max = 5000, message = "내용은 5000자 이하여야 합니다.")
        String content
) {
}

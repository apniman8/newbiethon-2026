package com.example.newbie.common.exception;

import io.swagger.v3.oas.annotations.media.Schema;

public record ErrorResponse(
        @Schema(description = "오류 코드", example = "SAMPLE_NOT_FOUND")
        String code,

        @Schema(description = "오류 메시지", example = "Sample을 찾을 수 없습니다.")
        String message
) {

    public static ErrorResponse from(ErrorCode errorCode) {
        return new ErrorResponse(errorCode.getCode(), errorCode.getMessage());
    }

    public static ErrorResponse of(ErrorCode errorCode, String message) {
        return new ErrorResponse(errorCode.getCode(), message);
    }
}

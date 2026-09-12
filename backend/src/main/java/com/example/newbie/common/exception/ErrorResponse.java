package com.example.newbie.common.exception;

import io.swagger.v3.oas.annotations.media.Schema;

public record ErrorResponse(
        @Schema(description = "Stable error code", example = "ROUTE_NOT_FOUND")
        String code,

        @Schema(description = "English user-facing error message", example = "No accessible route is available for the selected profile.")
        String message
) {

    public static ErrorResponse from(ErrorCode errorCode) {
        return new ErrorResponse(errorCode.getCode(), errorCode.getMessage());
    }

    public static ErrorResponse of(ErrorCode errorCode, String message) {
        return new ErrorResponse(errorCode.getCode(), message);
    }
}

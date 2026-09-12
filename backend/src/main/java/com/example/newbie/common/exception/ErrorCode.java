package com.example.newbie.common.exception;

import org.springframework.http.HttpStatus;

public enum ErrorCode {

    INVALID_REQUEST(HttpStatus.BAD_REQUEST, "INVALID_REQUEST", "The request format is invalid."),
    VALIDATION_ERROR(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "The request contains invalid values."),
    INVALID_PLACE(HttpStatus.BAD_REQUEST, "INVALID_PLACE", "The selected place is not available on this map."),
    INVALID_PROFILE(HttpStatus.BAD_REQUEST, "INVALID_PROFILE", "The selected travel profile is not supported."),
    MAP_NOT_FOUND(HttpStatus.NOT_FOUND, "MAP_NOT_FOUND", "The requested station map was not found."),
    ROUTE_NOT_FOUND(HttpStatus.NOT_FOUND, "ROUTE_NOT_FOUND", "No accessible route is available for the selected profile."),
    GRAPH_DATA_INVALID(HttpStatus.INTERNAL_SERVER_ERROR, "GRAPH_DATA_INVALID", "The station map data is invalid."),
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Missing or invalid admin key."),
    API_NOT_FOUND(HttpStatus.NOT_FOUND, "API_NOT_FOUND", "The requested API endpoint was not found."),
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_SERVER_ERROR", "An unexpected server error occurred.");

    private final HttpStatus status;
    private final String code;
    private final String message;

    ErrorCode(HttpStatus status, String code, String message) {
        this.status = status;
        this.code = code;
        this.message = message;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public String getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }
}

package com.example.newbie.domain.indoor.model;

import com.example.newbie.domain.indoor.exception.GraphDataInvalidException;

final class GraphDataAssertions {

    private GraphDataAssertions() {
    }

    static String requireText(String value, String field) {
        if (value == null || value.isBlank()) {
            throw new GraphDataInvalidException(field + " must not be blank");
        }
        return value;
    }

    static <T> T requireValue(T value, String field) {
        if (value == null) {
            throw new GraphDataInvalidException(field + " must not be null");
        }
        return value;
    }

    static int requireNonNegative(int value, String field) {
        if (value < 0) {
            throw new GraphDataInvalidException(field + " must not be negative");
        }
        return value;
    }
}

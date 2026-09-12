package com.example.newbie.domain.indoor;

import com.example.newbie.domain.indoor.exception.GraphDataInvalidException;
import java.util.List;

/**
 * Signals that the station map data is malformed, unreadable, or internally
 * inconsistent. Thrown during bean construction so a bad seed fails
 * application startup outright; also thrown defensively if something that
 * GraphValidator already guarantees is ever violated at request time.
 */
public class GraphDataException extends GraphDataInvalidException {

    public GraphDataException(String message) {
        super(message);
    }

    public GraphDataException(String message, Throwable cause) {
        super(message, cause);
    }

    public GraphDataException(List<String> errors) {
        super("Invalid station map data:\n - " + String.join("\n - ", errors));
    }
}

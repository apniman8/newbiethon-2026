package com.example.newbie.domain.indoor.exception;

public class GraphDataInvalidException extends RuntimeException {

    public GraphDataInvalidException(String internalMessage) {
        super(internalMessage);
    }

    public GraphDataInvalidException(String internalMessage, Throwable cause) {
        super(internalMessage, cause);
    }
}

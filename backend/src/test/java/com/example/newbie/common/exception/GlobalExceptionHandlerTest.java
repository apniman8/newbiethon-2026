package com.example.newbie.common.exception;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.example.newbie.domain.indoor.exception.GraphDataInvalidException;
import com.example.newbie.domain.indoor.model.RoutingProfile;
import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.mock.http.MockHttpInputMessage;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void hidesInternalGraphValidationDetailsFromApiResponse() {
        var response = handler.handleGraphDataInvalid(
                new GraphDataInvalidException("edge.fromNodeId must not be blank")
        );

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertEquals("GRAPH_DATA_INVALID", response.getBody().code());
        assertEquals("The station map data is invalid.", response.getBody().message());
    }

    @Test
    void mapsUnknownRoutingProfileToInvalidProfile() {
        InvalidFormatException cause = InvalidFormatException.from(
                null,
                "Unknown routing profile",
                "BICYCLE",
                RoutingProfile.class
        );
        HttpMessageNotReadableException exception = new HttpMessageNotReadableException(
                "JSON parse error",
                cause,
                new MockHttpInputMessage(new byte[0])
        );

        var response = handler.handleUnreadableMessage(exception);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("INVALID_PROFILE", response.getBody().code());
    }
}

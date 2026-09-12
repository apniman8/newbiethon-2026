package com.example.newbie.domain.indoor.exception;

import com.example.newbie.common.exception.BusinessException;
import com.example.newbie.common.exception.ErrorCode;

public class InvalidPlaceException extends BusinessException {

    public InvalidPlaceException(String mapId, String placeId) {
        super(ErrorCode.INVALID_PLACE, "Place '%s' is not available on map '%s'.".formatted(placeId, mapId));
    }
}

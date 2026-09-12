package com.example.newbie.domain.indoor.exception;

import com.example.newbie.common.exception.BusinessException;
import com.example.newbie.common.exception.ErrorCode;

public class MapNotFoundException extends BusinessException {

    public MapNotFoundException(String mapId) {
        super(ErrorCode.MAP_NOT_FOUND, "Station map '%s' was not found.".formatted(mapId));
    }
}

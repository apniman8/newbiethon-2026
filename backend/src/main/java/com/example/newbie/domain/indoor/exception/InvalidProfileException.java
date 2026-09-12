package com.example.newbie.domain.indoor.exception;

import com.example.newbie.common.exception.BusinessException;
import com.example.newbie.common.exception.ErrorCode;
import com.example.newbie.domain.indoor.model.RoutingProfile;

public class InvalidProfileException extends BusinessException {

    public InvalidProfileException(String mapId, RoutingProfile profile) {
        super(ErrorCode.INVALID_PROFILE, "Profile '%s' is not supported by map '%s'.".formatted(profile, mapId));
    }
}

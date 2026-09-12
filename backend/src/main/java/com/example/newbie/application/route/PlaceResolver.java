package com.example.newbie.application.route;

import com.example.newbie.common.exception.BusinessException;
import com.example.newbie.common.exception.ErrorCode;
import com.example.newbie.domain.indoor.model.SelectablePlace;
import com.example.newbie.domain.indoor.model.StationMap;
import java.util.function.Predicate;
import org.springframework.stereotype.Component;

@Component
public class PlaceResolver {

    public SelectablePlace resolveStart(StationMap map, String placeId) {
        return resolve(map, placeId, SelectablePlace::selectableAsStart);
    }

    public SelectablePlace resolveDestination(StationMap map, String placeId) {
        return resolve(map, placeId, SelectablePlace::selectableAsDestination);
    }

    private SelectablePlace resolve(StationMap map, String placeId, Predicate<SelectablePlace> roleCheck) {
        return map.places().stream()
                .filter(place -> place.id().equals(placeId))
                .filter(roleCheck)
                .findFirst()
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_PLACE));
    }
}

package com.example.newbie.application.route;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.example.newbie.common.exception.BusinessException;
import com.example.newbie.common.exception.ErrorCode;
import com.example.newbie.domain.indoor.model.FacilityDataStatus;
import com.example.newbie.domain.indoor.model.PlaceType;
import com.example.newbie.domain.indoor.model.RoutingProfile;
import com.example.newbie.domain.indoor.model.SelectablePlace;
import com.example.newbie.domain.indoor.model.StationMap;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;

class PlaceResolverTest {

    private final PlaceResolver resolver = new PlaceResolver();

    private final StationMap map = new StationMap(
            "TEST_MAP", "v1", true, FacilityDataStatus.STATIC,
            Set.of(RoutingProfile.STANDARD),
            List.of(),
            List.of(
                    new SelectablePlace("P-START", "Start", "Start place", "N-1", PlaceType.ARRIVAL, true, false, 1),
                    new SelectablePlace("P-END", "End", "End place", "N-2", PlaceType.PLATFORM, false, true, 2)
            ),
            List.of(), List.of(), List.of()
    );

    @Test
    void resolvesAValidStartPlace() {
        SelectablePlace place = resolver.resolveStart(map, "P-START");
        assertEquals("N-1", place.nodeId());
    }

    @Test
    void resolvesAValidDestinationPlace() {
        SelectablePlace place = resolver.resolveDestination(map, "P-END");
        assertEquals("N-2", place.nodeId());
    }

    @Test
    void rejectsUnknownPlaceId() {
        BusinessException exception = assertThrows(BusinessException.class,
                () -> resolver.resolveStart(map, "DOES-NOT-EXIST"));
        assertEquals(ErrorCode.INVALID_PLACE, exception.getErrorCode());
    }

    @Test
    void rejectsAPlaceUsedInTheWrongRole() {
        // P-END is not selectableAsStart
        assertThrows(BusinessException.class, () -> resolver.resolveStart(map, "P-END"));
        // P-START is not selectableAsDestination
        assertThrows(BusinessException.class, () -> resolver.resolveDestination(map, "P-START"));
    }
}

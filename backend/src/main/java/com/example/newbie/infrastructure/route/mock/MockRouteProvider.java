package com.example.newbie.infrastructure.route.mock;

import com.example.newbie.application.route.RoutePlan;
import com.example.newbie.application.route.RouteProvider;
import com.example.newbie.application.route.RouteQuery;
import com.example.newbie.common.exception.BusinessException;
import com.example.newbie.common.exception.ErrorCode;
import com.example.newbie.domain.indoor.model.FacilityDataStatus;
import com.example.newbie.domain.indoor.model.RoutingProfile;
import java.util.List;
import java.util.Map;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(
        name = "app.mock-route.enabled",
        havingValue = "true",
        matchIfMissing = true
)
public class MockRouteProvider implements RouteProvider {

    static final String MAP_ID = "SEOUL_STATION_KTX_TO_AREX";
    static final String START_PLACE_ID = "SEOUL_KTX_ARRIVAL";
    static final String DESTINATION_PLACE_ID = "SEOUL_AREX_PLATFORM";

    private static final RoutePlan.Place START = new RoutePlan.Place(
            START_PLACE_ID,
            "SEOUL-KTX-N001",
            "Seoul Station KTX Arrival Hall",
            "1F"
    );
    private static final RoutePlan.Place DESTINATION = new RoutePlan.Place(
            DESTINATION_PLACE_ID,
            "SEOUL-AREX-N004",
            "AREX Platform",
            "B7"
    );
    private static final Map<String, RoutePlan.Place> PLACES = Map.of(
            START_PLACE_ID, START,
            DESTINATION_PLACE_ID, DESTINATION
    );

    @Override
    public RoutePlan findRoute(RouteQuery query) {
        validateQuery(query);

        RoutePlan.Place start = PLACES.get(query.startPlaceId());
        RoutePlan.Place destination = PLACES.get(query.destinationPlaceId());

        if (query.startPlaceId().equals(query.destinationPlaceId())) {
            return zeroRoute(query, start);
        }
        if (!START_PLACE_ID.equals(query.startPlaceId())
                || !DESTINATION_PLACE_ID.equals(query.destinationPlaceId())) {
            throw new BusinessException(ErrorCode.ROUTE_NOT_FOUND);
        }

        return demoRoute(query, start, destination);
    }

    private void validateQuery(RouteQuery query) {
        if (!MAP_ID.equals(query.mapId())) {
            throw new BusinessException(ErrorCode.MAP_NOT_FOUND);
        }
        if (!PLACES.containsKey(query.startPlaceId())
                || !PLACES.containsKey(query.destinationPlaceId())) {
            throw new BusinessException(ErrorCode.INVALID_PLACE);
        }
        if (query.profile() != RoutingProfile.STANDARD
                && query.profile() != RoutingProfile.LUGGAGE) {
            throw new BusinessException(ErrorCode.INVALID_PROFILE);
        }
    }

    private RoutePlan zeroRoute(RouteQuery query, RoutePlan.Place place) {
        return new RoutePlan(
                "v1.2",
                routeId(query),
                MAP_ID,
                query.profile(),
                place,
                place,
                new RoutePlan.Summary(0, 0, 0, false, 0),
                FacilityDataStatus.STATIC,
                List.of()
        );
    }

    private RoutePlan demoRoute(
            RouteQuery query,
            RoutePlan.Place start,
            RoutePlan.Place destination
    ) {
        int durationSeconds = query.profile() == RoutingProfile.LUGGAGE ? 420 : 360;

        List<RoutePlan.Segment> segments = List.of(
                new RoutePlan.MapSegment(
                        1,
                        "SEOUL_KTX_OVERVIEW",
                        "1F",
                        List.of("SEOUL-KTX-N001", "SEOUL-KTX-N002", "SEOUL-KTX-N003"),
                        List.of("SEOUL-KTX-E001", "SEOUL-KTX-E002"),
                        155,
                        150
                ),
                new RoutePlan.TransitionSegment(
                        2,
                        "SEOUL_KTX_OVERVIEW",
                        "SEOUL_AREX_EXPLODED",
                        "SEOUL-KTX-N003",
                        "SEOUL-AREX-N001",
                        "Continue on the Airport Railroad map."
                ),
                new RoutePlan.MapSegment(
                        3,
                        "SEOUL_AREX_EXPLODED",
                        "1F-B7",
                        List.of(
                                "SEOUL-AREX-N001",
                                "SEOUL-AREX-N002",
                                "SEOUL-AREX-N003",
                                "SEOUL-AREX-N004"
                        ),
                        List.of("SEOUL-AREX-E001", "SEOUL-AREX-E002", "SEOUL-AREX-E003"),
                        125,
                        durationSeconds - 150
                )
        );

        return new RoutePlan(
                "v1.2",
                routeId(query),
                MAP_ID,
                query.profile(),
                start,
                destination,
                new RoutePlan.Summary(280, durationSeconds, 3, false, 1),
                FacilityDataStatus.STATIC,
                segments
        );
    }

    private String routeId(RouteQuery query) {
        return "mock-ktx-to-arex-" + query.profile().name().toLowerCase();
    }
}

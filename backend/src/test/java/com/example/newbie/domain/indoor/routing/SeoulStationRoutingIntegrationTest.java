package com.example.newbie.domain.indoor.routing;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.example.newbie.domain.indoor.model.RoutingProfile;
import com.example.newbie.domain.indoor.model.StationMap;
import com.example.newbie.domain.indoor.repository.GraphRepository;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * Exercises the real map-v1.json seed end to end: load -> validate (already
 * covered by context startup) -> Dijkstra, for the one route the P0 demo
 * actually needs (KTX arrival to a Line 1 platform).
 */
@SpringBootTest
class SeoulStationRoutingIntegrationTest {

    @Autowired
    private GraphRepository graphRepository;

    @Autowired
    private RouteFinder routeFinder;

    @Test
    void findsARouteFromKtxArrivalToLine1PlatformForBothSupportedProfiles() {
        StationMap map = graphRepository.findById("SEOUL_STATION_KTX_TO_AREX").orElseThrow();

        PathResult standardResult = routeFinder.find(
                map, "SEOUL-1F-N010", "SEOUL-B2-N080",
                new RoutingContext(RoutingProfile.STANDARD, Map.of())
        );
        PathResult luggageResult = routeFinder.find(
                map, "SEOUL-1F-N010", "SEOUL-B2-N080",
                new RoutingContext(RoutingProfile.LUGGAGE, Map.of())
        );

        assertFalse(standardResult.edges().isEmpty());
        assertFalse(luggageResult.edges().isEmpty());
        assertTrue(standardResult.totalCostSeconds() > 0);
        assertTrue(luggageResult.totalCostSeconds() > 0);
    }
}

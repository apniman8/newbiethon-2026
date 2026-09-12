package com.example.newbie.domain.indoor.routing;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.example.newbie.domain.indoor.model.GraphEdge;
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

    @Test
    void keepsThePresentationRouteFromLine1ToLine4OnAuthoredGeometry() {
        StationMap map = graphRepository.findById("SEOUL_STATION_KTX_TO_AREX").orElseThrow();

        PathResult result = routeFinder.find(
                map, "SEOUL-B2-N080", "SEOUL-B2-N100",
                new RoutingContext(RoutingProfile.STANDARD, Map.of())
        );

        assertThat(result.edges())
                .extracting(GraphEdge::id)
                .containsExactly(
                        "SEOUL-E011",
                        "SEOUL-E010",
                        "SEOUL-E009",
                        "SEOUL-E012",
                        "SEOUL-E013",
                        "SEOUL-E014"
                );
        assertThat(result.edges())
                .filteredOn(edge -> edge.movementType().name().equals("WALK") && edge.distanceMeters() >= 8)
                .allSatisfy(edge -> assertThat(edge.geometry()).hasSizeGreaterThan(2));
        assertThat(result.edges().getFirst().geometry().getFirst().x()).isEqualTo(0.817);
        assertThat(result.edges().getFirst().geometry().getFirst().y()).isEqualTo(0.466);
        assertThat(result.edges().getLast().geometry().getLast().x()).isEqualTo(0.29);
        assertThat(result.edges().getLast().geometry().getLast().y()).isEqualTo(0.79);
    }
}

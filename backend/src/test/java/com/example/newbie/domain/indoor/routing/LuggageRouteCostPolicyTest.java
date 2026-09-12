package com.example.newbie.domain.indoor.routing;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.example.newbie.domain.indoor.model.FacilityStatus;
import com.example.newbie.domain.indoor.model.GraphEdge;
import com.example.newbie.domain.indoor.model.MovementType;
import com.example.newbie.domain.indoor.model.RoutingProfile;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class LuggageRouteCostPolicyTest {

    private final LuggageRouteCostPolicy policy = new LuggageRouteCostPolicy();

    @Test
    void alwaysBlocksStairs() {
        assertFalse(policy.isAllowed(edge(MovementType.STAIR, null), context(Map.of())));
    }

    @Test
    void allowsRamp() {
        assertTrue(policy.isAllowed(edge(MovementType.RAMP, null), context(Map.of())));
    }

    @Test
    void blocksOutOfServiceFacility() {
        assertFalse(policy.isAllowed(edge(MovementType.ELEVATOR, "F-1"), context(Map.of("F-1", FacilityStatus.OUT_OF_SERVICE))));
    }

    @Test
    void treatsUnknownFacilityStatusAsAvailable() {
        assertTrue(policy.isAllowed(edge(MovementType.ELEVATOR, "F-1"), context(Map.of())));
    }

    @Test
    void addsLargerEscalatorPenaltyThanStandard() {
        assertEquals(40, policy.calculateCost(edge(MovementType.ESCALATOR, null, 10), context(Map.of())));
    }

    @Test
    void addsElevatorWaitPenalty() {
        assertEquals(55, policy.calculateCost(edge(MovementType.ELEVATOR, null, 10), context(Map.of())));
    }

    private RoutingContext context(Map<String, FacilityStatus> facilityStatuses) {
        return new RoutingContext(RoutingProfile.LUGGAGE, facilityStatuses);
    }

    private GraphEdge edge(MovementType movementType, String facilityId) {
        return edge(movementType, facilityId, 0);
    }

    private GraphEdge edge(MovementType movementType, String facilityId, int baseDurationSeconds) {
        return new GraphEdge("E-1", "N-1", "N-2", baseDurationSeconds, baseDurationSeconds, movementType, "Test.", "Test reverse.", facilityId, true, List.of());
    }
}

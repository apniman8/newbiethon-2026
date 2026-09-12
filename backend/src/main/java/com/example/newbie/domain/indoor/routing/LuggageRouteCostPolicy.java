package com.example.newbie.domain.indoor.routing;

import com.example.newbie.domain.indoor.model.FacilityStatus;
import com.example.newbie.domain.indoor.model.GraphEdge;
import com.example.newbie.domain.indoor.model.MovementType;
import org.springframework.stereotype.Component;

/**
 * LUGGAGE profile: STAIR is always excluded. UNKNOWN facility status is
 * treated as AVAILABLE for the same reason as STANDARD — this profile still
 * has a walking fallback if an elevator/escalator turns out unavailable in
 * reality, so we favor demo stability over caution here (WHEELCHAIR does the
 * opposite; see its cost policy once P1 adds it).
 */
@Component
public class LuggageRouteCostPolicy implements RouteCostPolicy {

    private static final int ESCALATOR_PENALTY_SECONDS = 30;
    private static final int ELEVATOR_WAIT_SECONDS = 45;

    @Override
    public boolean isAllowed(GraphEdge edge, RoutingContext context) {
        if (edge.movementType() == MovementType.STAIR) {
            return false;
        }
        return isFacilityUsable(edge, context);
    }

    @Override
    public int calculateCost(GraphEdge edge, RoutingContext context) {
        return edge.baseDurationSeconds() + movementPenaltySeconds(edge.movementType());
    }

    private int movementPenaltySeconds(MovementType movementType) {
        return switch (movementType) {
            case ESCALATOR -> ESCALATOR_PENALTY_SECONDS;
            case ELEVATOR -> ELEVATOR_WAIT_SECONDS;
            case WALK, RAMP, MOVING_WALKWAY -> 0;
            case STAIR -> 0; // unreachable: isAllowed already excludes STAIR
        };
    }

    private boolean isFacilityUsable(GraphEdge edge, RoutingContext context) {
        if (edge.facilityId() == null) {
            return true;
        }
        return context.facilityStatus(edge.facilityId()) != FacilityStatus.OUT_OF_SERVICE;
    }
}

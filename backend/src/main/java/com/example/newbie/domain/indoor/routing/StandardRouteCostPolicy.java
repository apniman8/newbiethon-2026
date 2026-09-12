package com.example.newbie.domain.indoor.routing;

import com.example.newbie.domain.indoor.model.FacilityStatus;
import com.example.newbie.domain.indoor.model.GraphEdge;
import com.example.newbie.domain.indoor.model.MovementType;
import org.springframework.stereotype.Component;

/**
 * STANDARD profile: every movement type is allowed. UNKNOWN facility status
 * is treated as AVAILABLE (optimistic default — see RoutingContext), only
 * OUT_OF_SERVICE blocks an edge.
 */
@Component
public class StandardRouteCostPolicy implements RouteCostPolicy {

    private static final int STAIR_PENALTY_SECONDS = 5;
    private static final int ESCALATOR_PENALTY_SECONDS = 10;
    private static final int ELEVATOR_WAIT_SECONDS = 45;

    @Override
    public boolean isAllowed(GraphEdge edge, RoutingContext context) {
        return isFacilityUsable(edge, context);
    }

    @Override
    public int calculateCost(GraphEdge edge, RoutingContext context) {
        return edge.baseDurationSeconds() + movementPenaltySeconds(edge.movementType());
    }

    private int movementPenaltySeconds(MovementType movementType) {
        return switch (movementType) {
            case STAIR -> STAIR_PENALTY_SECONDS;
            case ESCALATOR -> ESCALATOR_PENALTY_SECONDS;
            case ELEVATOR -> ELEVATOR_WAIT_SECONDS;
            case WALK, RAMP, MOVING_WALKWAY -> 0;
        };
    }

    private boolean isFacilityUsable(GraphEdge edge, RoutingContext context) {
        if (edge.facilityId() == null) {
            return true;
        }
        return context.facilityStatus(edge.facilityId()) != FacilityStatus.OUT_OF_SERVICE;
    }
}

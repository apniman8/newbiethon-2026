package com.example.newbie.infrastructure.route.mock;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.example.newbie.application.route.RoutePlan;
import com.example.newbie.application.route.RouteQuery;
import com.example.newbie.common.exception.BusinessException;
import com.example.newbie.common.exception.ErrorCode;
import com.example.newbie.domain.indoor.model.RoutingProfile;
import org.junit.jupiter.api.Test;

class MockRouteProviderTest {

    private final MockRouteProvider provider = new MockRouteProvider();

    @Test
    void returnsMapTransitionMapSegmentsForTheDemoRoute() {
        RoutePlan result = provider.findRoute(new RouteQuery(
                MockRouteProvider.MAP_ID,
                MockRouteProvider.START_PLACE_ID,
                MockRouteProvider.DESTINATION_PLACE_ID,
                RoutingProfile.LUGGAGE
        ));

        assertThat(result.apiVersion()).isEqualTo("v1.2");
        assertThat(result.segments()).hasSize(3);
        assertThat(result.segments().get(0)).isInstanceOf(RoutePlan.MapSegment.class);
        assertThat(result.segments().get(1)).isInstanceOf(RoutePlan.TransitionSegment.class);
        assertThat(result.segments().get(2)).isInstanceOf(RoutePlan.MapSegment.class);
        assertThat(result.summary().usesStairs()).isFalse();
        assertThat(result.summary().elevatorCount()).isEqualTo(1);
    }

    @Test
    void returnsAnEmptyRouteWhenStartAndDestinationAreTheSame() {
        RoutePlan result = provider.findRoute(new RouteQuery(
                MockRouteProvider.MAP_ID,
                MockRouteProvider.START_PLACE_ID,
                MockRouteProvider.START_PLACE_ID,
                RoutingProfile.STANDARD
        ));

        assertThat(result.summary().totalDistanceMeters()).isZero();
        assertThat(result.segments()).isEmpty();
    }

    @Test
    void rejectsUnsupportedProfiles() {
        assertThatThrownBy(() -> provider.findRoute(new RouteQuery(
                MockRouteProvider.MAP_ID,
                MockRouteProvider.START_PLACE_ID,
                MockRouteProvider.DESTINATION_PLACE_ID,
                RoutingProfile.WHEELCHAIR
        )))
                .isInstanceOf(BusinessException.class)
                .extracting(exception -> ((BusinessException) exception).getErrorCode())
                .isEqualTo(ErrorCode.INVALID_PROFILE);
    }
}

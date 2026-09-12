package com.example.newbie.api.route.dto;

/**
 * One entry in RouteResponse.segments — either a MapSegmentResponse (a run of
 * nodes/edges drawn on a single map image) or a MapTransitionSegmentResponse
 * (a handoff between two map images with no drawable geometry).
 */
public sealed interface RouteSegment permits MapSegmentResponse, MapTransitionSegmentResponse {

    int sequence();
}

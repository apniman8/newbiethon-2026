# Easy-Transfer API enums v1.1

Enum values are case-sensitive and remain in `UPPER_SNAKE_CASE`.

## RoutingProfile

- `STANDARD`
- `LUGGAGE`

`WHEELCHAIR` is reserved for a later contract version and must not be offered by the Phase 0 UI.

## PlaceType

- `ARRIVAL`
- `PLATFORM`
- `EXIT`
- `FACILITY`

## Direction

- `START`
- `STRAIGHT`
- `LEFT`
- `RIGHT`
- `SLIGHT_LEFT`
- `SLIGHT_RIGHT`
- `U_TURN`
- `UP`
- `DOWN`
- `ARRIVE`

## MovementType

- `WALK`
- `STAIR`
- `ESCALATOR`
- `ELEVATOR`
- `RAMP`
- `MOVING_WALKWAY`

## NodeType

- `PLATFORM_POINT`
- `INTERSECTION`
- `GATE`
- `CORRIDOR_END`
- `ELEVATOR_ENTRANCE`
- `ELEVATOR_EXIT`
- `ESCALATOR_ENTRANCE`
- `ESCALATOR_EXIT`
- `STAIR_ENTRANCE`
- `STAIR_EXIT`
- `DESTINATION`

## LandmarkType

- `SIGN`
- `STORE`
- `INFORMATION_DESK`
- `RESTROOM`
- `EXIT`
- `TICKET_GATE`
- `ELEVATOR`
- `OTHER`

## LandmarkPosition

- `LEFT`
- `RIGHT`
- `AHEAD`
- `BEHIND`
- `OVERHEAD`

## FacilityDataStatus

- `STATIC`
- `LIVE`
- `STALE`

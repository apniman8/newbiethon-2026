# Easy-Transfer Route Contract v1.2

The v1.2 fixtures are the frontend source of truth until the real graph provider replaces the mock provider.

## Endpoint

- Method: `POST`
- Path: `/api/v1/routes`
- Content-Type: `application/json`

Request example:

```json
{
  "mapId": "SEOUL_STATION_KTX_TO_AREX",
  "startPlaceId": "SEOUL_KTX_ARRIVAL",
  "destinationPlaceId": "SEOUL_AREX_PLATFORM",
  "profile": "LUGGAGE"
}
```

## Frontend integration

- Load `map-detail-contract-v1.2.json` before rendering a route.
- Join `segments[].nodeIds` with `nodes[].id`.
- Join `segments[].edgeIds` with `renderEdges[].id`.
- Render `renderEdges[].geometry` as SVG polylines over the matching map image.
- Show a transition card instead of a polyline for a `TRANSITION` segment.
- The current mock provider supports `STANDARD` and `LUGGAGE` for KTX arrival to AREX platform.
- A same-place request returns HTTP 200 with zero summary values and an empty `segments` array.
- Set `app.mock-route.enabled=false` only after a real `RouteProvider` implementation is available.

## Enums

### RoutingProfile

- `STANDARD`
- `LUGGAGE`

`WHEELCHAIR` is not exposed by the P0 mock because the route has not been field-verified.

### SegmentType

- `MAP`: Render `edgeIds` on `mapImageId`.
- `TRANSITION`: Replace the current map with `toMapImageId` after showing `instruction`.

### MovementType

- `WALK`
- `STAIR`
- `ESCALATOR`
- `ELEVATOR`
- `RAMP`
- `MOVING_WALKWAY`

### NodeType

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

## Coordinate rules

- `imageX` and `imageY` are normalized values from `0.0` to `1.0`.
- Each `mapImageId` has an independent coordinate system.
- Geometry is for rendering only and must not be converted into physical distance.
- `distanceMeters` is demo data until field verification is complete.

## Errors

- `MAP_NOT_FOUND`: unknown map ID
- `INVALID_PLACE`: unknown place ID
- `INVALID_PROFILE`: unsupported profile
- `ROUTE_NOT_FOUND`: known places without a prepared route
- `VALIDATION_ERROR`: missing request field

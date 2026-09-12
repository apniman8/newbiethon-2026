# Easy-Transfer Route Contract v1.2

The v1.2 fixtures describe the response produced by the static JSON graph, Dijkstra route finder, and route segment assembler.

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

- Read the map assets from the top-level `mapImages` array.
- A `MAP` segment contains the route's complete `nodes` and `edges` for that image.
- Render `segments[].edges[].geometry` as SVG polylines over the matching map image.
- Render `segments[].nodes` as clickable markers using normalized `imageX` and `imageY`.
- Show a transition card instead of a polyline for a `TRANSITION` segment.
- The current static graph supports `STANDARD` and `LUGGAGE` and includes a demo KTX-arrival-to-AREX-platform route.
- A same-place request returns HTTP 200 with zero summary values and one `MAP` segment containing the selected node.
- `routeId` is generated per request and must be treated as opaque.

## Enums

### RoutingProfile

- `STANDARD`
- `LUGGAGE`

`WHEELCHAIR` is not exposed because the route has not been field-verified.

### SegmentType

- `MAP`: Render the segment's `edges` and `nodes` on `mapImageId`.
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

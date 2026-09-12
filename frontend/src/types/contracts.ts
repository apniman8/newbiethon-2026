// Mirrors contracts/v1.2 (route-contract-v1.2.json, places-contract-v1.2.json,
// route-enums-v1.2.md). Keep this file in sync when the contract version changes.
//
// v1.2 replaced v1.1's flat `steps[]` with `segments[]`: a MAP segment carries
// the nodes and edges drawn on one map image, a TRANSITION segment hands over
// to a different map image. Coordinates now come from the API, normalized 0..1
// per map image (docs/ADR.md ADR-014).

export type RoutingProfile = 'STANDARD' | 'LUGGAGE';
// WHEELCHAIR is not exposed — the route has not been field-verified
// (route-enums-v1.2.md).

export type PlaceType = 'ARRIVAL' | 'PLATFORM' | 'EXIT' | 'FACILITY';

export type SegmentType = 'MAP' | 'TRANSITION';

export type MovementType =
  | 'WALK'
  | 'STAIR'
  | 'ESCALATOR'
  | 'ELEVATOR'
  | 'RAMP'
  | 'MOVING_WALKWAY';

export type NodeType =
  | 'PLATFORM_POINT'
  | 'INTERSECTION'
  | 'GATE'
  | 'CORRIDOR_END'
  | 'ELEVATOR_ENTRANCE'
  | 'ELEVATOR_EXIT'
  | 'ESCALATOR_ENTRANCE'
  | 'ESCALATOR_EXIT'
  | 'STAIR_ENTRANCE'
  | 'STAIR_EXIT'
  | 'DESTINATION';

export type FacilityDataStatus = 'STATIC' | 'LIVE' | 'STALE';

export interface Place {
  id: string;
  displayName: string;
  description: string;
  placeType: PlaceType;
  selectableAsStart: boolean;
  selectableAsDestination: boolean;
}

export interface PlacesResponse {
  mapId: string;
  places: Place[];
}

export interface MapImage {
  id: string;
  displayName: string;
  assetKey: string;
  intrinsicWidth: number;
  intrinsicHeight: number;
}

/** Normalized 0..1 point in its map image's own coordinate system. */
export interface ImagePoint {
  x: number;
  y: number;
}

export interface RouteNode {
  id: string;
  nodeType: NodeType;
  floor: string;
  mapImageId: string;
  imageX: number;
  imageY: number;
  description: string;
  facilityId: string | null;
}

export interface RouteEdge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  distanceMeters: number;
  baseDurationSeconds: number;
  movementType: MovementType;
  instruction: string;
  facilityId: string | null;
  accessible: boolean;
  geometry: ImagePoint[];
}

export interface MapSegment {
  segmentType: 'MAP';
  sequence: number;
  mapImageId: string;
  floor: string;
  nodes: RouteNode[];
  edges: RouteEdge[];
}

export interface TransitionSegment {
  segmentType: 'TRANSITION';
  sequence: number;
  mapTransition: boolean;
  fromMapImageId: string;
  toMapImageId: string;
  fromNodeId: string;
  toNodeId: string;
  instruction: string;
}

export type RouteSegment = MapSegment | TransitionSegment;

export interface RouteEndpoint {
  placeId: string;
  nodeId: string;
  displayName: string;
  floor: string;
}

export interface RouteSummary {
  totalDistanceMeters: number;
  estimatedDurationSeconds: number;
  segmentCount: number;
  usesStairs: boolean;
  elevatorCount: number;
}

export interface RouteResponse {
  apiVersion: string;
  routeId: string;
  mapId: string;
  profile: RoutingProfile;
  start: RouteEndpoint;
  destination: RouteEndpoint;
  summary: RouteSummary;
  facilityDataStatus: FacilityDataStatus;
  mapImages: MapImage[];
  segments: RouteSegment[];
}

/** POST /api/v1/routes request body (route-enums-v1.2.md). */
export interface RouteRequest {
  mapId: string;
  startPlaceId: string;
  destinationPlaceId: string;
  profile: RoutingProfile;
}

/** Error codes the backend returns in the response body (ErrorCode.java). */
export type BackendErrorCode =
  | 'INVALID_REQUEST'
  | 'VALIDATION_ERROR'
  | 'INVALID_PLACE'
  | 'INVALID_PROFILE'
  | 'MAP_NOT_FOUND'
  | 'ROUTE_NOT_FOUND'
  | 'GRAPH_DATA_INVALID'
  | 'UNAUTHORIZED'
  | 'API_NOT_FOUND'
  | 'INTERNAL_SERVER_ERROR';

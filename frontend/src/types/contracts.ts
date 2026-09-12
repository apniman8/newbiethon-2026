// Mirrors contracts/v1.1 (route-contract-v1.1.json, places-contract-v1.1.json,
// route-enums-v1.1.md). Keep this file in sync when the contract version changes.

export type RoutingProfile = 'STANDARD' | 'LUGGAGE';
// WHEELCHAIR is reserved for a later contract version and must never be
// offered by this UI (see docs/ADR.md ADR-005 / route-enums-v1.1.md).

export type PlaceType = 'ARRIVAL' | 'PLATFORM' | 'EXIT' | 'FACILITY';

export type Direction =
  | 'START'
  | 'STRAIGHT'
  | 'LEFT'
  | 'RIGHT'
  | 'SLIGHT_LEFT'
  | 'SLIGHT_RIGHT'
  | 'U_TURN'
  | 'UP'
  | 'DOWN'
  | 'ARRIVE';

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

export type LandmarkType =
  | 'SIGN'
  | 'STORE'
  | 'INFORMATION_DESK'
  | 'RESTROOM'
  | 'EXIT'
  | 'TICKET_GATE'
  | 'ELEVATOR'
  | 'OTHER';

export type LandmarkPosition = 'LEFT' | 'RIGHT' | 'AHEAD' | 'BEHIND' | 'OVERHEAD';

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

export interface Landmark {
  id: string;
  type: LandmarkType;
  name: string;
  description: string;
  position: LandmarkPosition;
}

export interface RouteStep {
  sequence: number;
  fromNodeId: string;
  toNodeId: string;
  fromFloor: string;
  toFloor: string;
  nodeType: NodeType;
  movementType: MovementType;
  direction: Direction;
  distanceMeters: number;
  instruction: string;
  landmark: Landmark;
}

export interface RouteEndpoint {
  placeId: string;
  nodeId: string;
  displayName: string;
  floor: string;
}

export interface RouteSummary {
  totalDistanceMeters: number;
  estimatedDurationSeconds: number;
  stepCount: number;
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
  steps: RouteStep[];
}

// POST /api/v1/routes request body. Not spelled out verbatim in contracts/v1.1,
// inferred from Place.selectableAsStart/selectableAsDestination and the fixture's
// start/destination shape — confirm against the real backend once it's reachable.
export interface RouteRequest {
  mapId: string;
  startPlaceId: string;
  destinationPlaceId: string;
  profile: RoutingProfile;
}

// Data access boundary (docs/ARCHITECTURE.md "데이터 흐름"). Screens call only
// these functions and never fetch directly, so the fixture-backed build can be
// swapped for the live backend by editing this file alone.
//
// CRITICAL (docs/ADR.md ADR-007): only ever throw RouteServiceError here.
// Screens branch on `.kind` to show a distinct message per failure.

import { errorKindFromBody, RouteServiceError } from './errors';
import type { PlacesResponse, RouteRequest, RouteResponse } from '../types/contracts';
import placesFixture from './fixtures/places-seoul-station.json';
import routeFixture from './fixtures/route-demo.json';

// The backend (POST /api/v1/routes, GET /api/v1/maps/{mapId}/places) is
// implemented and serves v1.2. Flip this to false to talk to it; the fixtures
// below are the frozen contracts/v1.2 responses.
const USE_MOCK = true;

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

async function readErrorKind(res: Response) {
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    // an error body is not guaranteed; fall through to the status
  }
  return errorKindFromBody(body, res.status);
}

export async function getPlaces(mapId: string): Promise<PlacesResponse> {
  if (USE_MOCK) {
    return placesFixture as PlacesResponse;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/api/v1/maps/${mapId}/places`);
  } catch {
    throw new RouteServiceError('NETWORK', 'Failed to reach the places endpoint');
  }
  if (!res.ok) {
    throw new RouteServiceError(await readErrorKind(res), `getPlaces failed: ${res.status}`);
  }
  return res.json();
}

export async function getRoute(request: RouteRequest): Promise<RouteResponse> {
  if (USE_MOCK) {
    return mockGetRoute(request);
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/api/v1/routes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  } catch {
    throw new RouteServiceError('NETWORK', 'Failed to reach the routes endpoint');
  }
  if (!res.ok) {
    throw new RouteServiceError(await readErrorKind(res), `getRoute failed: ${res.status}`);
  }
  return res.json();
}

// The frozen fixture only carries the KTX-arrival-to-AREX demo route, so any
// other destination stands in for the backend's ROUTE_NOT_FOUND.
function mockGetRoute(request: RouteRequest): RouteResponse {
  const fixture = routeFixture as RouteResponse;

  if (request.destinationPlaceId === request.startPlaceId) {
    // v1.2: a same-place request is a 200 with zero summary values
    // (route-enums-v1.2.md), which flattens to an empty checklist.
    return {
      ...fixture,
      destination: { ...fixture.start },
      summary: {
        ...fixture.summary,
        totalDistanceMeters: 0,
        estimatedDurationSeconds: 0,
        segmentCount: 0,
      },
      segments: [],
    };
  }

  if (request.destinationPlaceId !== fixture.destination.placeId) {
    throw new RouteServiceError('NOT_FOUND', `No prepared route to ${request.destinationPlaceId}`);
  }

  return fixture;
}

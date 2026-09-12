// Data access boundary (docs/ARCHITECTURE.md "데이터 흐름"). Screens call only
// these functions and never fetch directly, so the fixture-backed MVP can be
// swapped for the real Phase 0 backend by editing this file alone.
//
// CRITICAL (docs/ADR.md ADR-007): only ever throw RouteServiceError here.
// Screens branch on `.kind` to show a distinct message per failure — never a
// generic Error.

import { errorKindFromStatus, RouteServiceError } from './errors';
import type { PlacesResponse, RouteRequest, RouteResponse } from '../types/contracts';
import placesFixture from './fixtures/places-seoul-station.json';
import routeFixture from './fixtures/route-demo.json';

const USE_MOCK = true; // flip to false once the backend is reachable, or read from env

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

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
    throw new RouteServiceError(errorKindFromStatus(res.status), `getPlaces failed: ${res.status}`);
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
    throw new RouteServiceError(errorKindFromStatus(res.status), `getRoute failed: ${res.status}`);
  }
  return res.json();
}

// Mirrors the shape of the real endpoint's failure modes so the UI's
// NOT_FOUND / "already there" paths (docs/ADR.md ADR-009) are exercisable
// without a live backend. The frozen fixture only models one demo route, so
// any other destination is treated as NOT_FOUND.
function mockGetRoute(request: RouteRequest): RouteResponse {
  const fixture = routeFixture as RouteResponse;

  if (request.destinationPlaceId === request.startPlaceId) {
    return {
      ...fixture,
      destination: { ...fixture.start },
      summary: { ...fixture.summary, totalDistanceMeters: 0, estimatedDurationSeconds: 0, stepCount: 0 },
      steps: [],
    };
  }

  if (request.destinationPlaceId !== fixture.destination.placeId) {
    throw new RouteServiceError('NOT_FOUND', `No demo route to ${request.destinationPlaceId}`);
  }

  return fixture;
}

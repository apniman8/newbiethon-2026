// Live API boundary (docs/ARCHITECTURE.md "데이터 흐름"). Screens call only
// these functions and never fetch directly.
//
// CRITICAL (docs/ADR.md ADR-007): only ever throw RouteServiceError here.
// Screens branch on `.kind` to show a distinct message per failure.

import { errorKindFromBody, RouteServiceError } from './errors';
import type { PlacesResponse, RouteRequest, RouteResponse } from '../types/contracts';

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

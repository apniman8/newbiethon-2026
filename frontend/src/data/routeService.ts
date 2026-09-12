// Live API boundary (docs/ARCHITECTURE.md "데이터 흐름"). Screens call only
// these functions and never fetch directly.
//
// CRITICAL (docs/ADR.md ADR-007): only ever throw RouteServiceError here.
// Screens branch on `.kind` to show a distinct message per failure.

import { errorKindFromBody, RouteServiceError } from './errors';
import type { PlacesResponse, RouteRequest, RouteResponse } from '../types/contracts';
import type { EditableStationMap } from '../types/editor';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://newbiethon-2026.onrender.com';

// Admin-only editor tool (NodeEditorScreen): the deployed backend doesn't
// carry these endpoints, and edits only make sense against a local source
// checkout anyway (see AdminGraphService), so this always targets localhost
// regardless of API_BASE_URL.
const ADMIN_API_BASE_URL = process.env.EXPO_PUBLIC_ADMIN_API_BASE_URL ?? 'http://localhost:8080';

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

export async function getStationMap(mapId: string): Promise<EditableStationMap> {
  let res: Response;
  try {
    res = await fetch(`${ADMIN_API_BASE_URL}/api/v1/maps/${mapId}`);
  } catch {
    throw new RouteServiceError('NETWORK', 'Failed to reach the map endpoint');
  }
  if (!res.ok) {
    throw new RouteServiceError(await readErrorKind(res), `getStationMap failed: ${res.status}`);
  }
  return res.json();
}

export interface GraphPatchPayload {
  nodes: { id: string; imageX: number; imageY: number }[];
  edges: { id: string; geometry: { x: number; y: number }[] }[];
}

export interface GraphPatchResult {
  message: string;
  nodesUpdated: number;
  edgesUpdated: number;
  restartRequired: boolean;
}

// Backs NodeEditorScreen's "Save to server" action. Writes map-v1.json on
// the backend (validated first) but does NOT hot-swap the running route
// engine's copy — restart the backend to actually route against the edit.
export async function saveGraphPatch(
  mapId: string,
  patch: GraphPatchPayload,
  adminKey: string,
): Promise<GraphPatchResult> {
  let res: Response;
  try {
    res = await fetch(`${ADMIN_API_BASE_URL}/api/v1/admin/maps/${mapId}/graph`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Key': adminKey },
      body: JSON.stringify(patch),
    });
  } catch {
    throw new RouteServiceError('NETWORK', 'Failed to reach the admin save endpoint');
  }
  if (!res.ok) {
    throw new RouteServiceError(await readErrorKind(res), `saveGraphPatch failed: ${res.status}`);
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

// docs/ADR.md ADR-012: destination is free text. A miss is a normal outcome,
// not a bug — the Loading screen turns it into RouteServiceError('NOT_FOUND').
// The origin screen now searches the same real place list (role: 'start') —
// the backend accepts more than one start place, so picking a different one
// (e.g. "Line 4 Platform") must actually change the routed start point.

import type { Place } from '../types/contracts';

export type PlaceRole = 'start' | 'destination';

function eligible(place: Place, role: PlaceRole): boolean {
  return role === 'start' ? place.selectableAsStart : place.selectableAsDestination;
}

export function matchPlaces(places: Place[], query: string, role: PlaceRole = 'destination', limit = 5): Place[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return places.filter((place) => eligible(place, role) && place.displayName.toLowerCase().includes(q)).slice(0, limit);
}

export function matchPlace(places: Place[], query: string, role: PlaceRole = 'destination'): Place | null {
  return matchPlaces(places, query, role, 1)[0] ?? null;
}

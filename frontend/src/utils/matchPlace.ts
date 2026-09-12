// docs/ADR.md ADR-012: destination is free text. A miss is a normal outcome,
// not a bug — the Loading screen turns it into RouteServiceError('NOT_FOUND').

import type { Place } from '../types/contracts';

export function matchPlaces(places: Place[], query: string, limit = 5): Place[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return places
    .filter((place) => place.selectableAsDestination && place.displayName.toLowerCase().includes(q))
    .slice(0, limit);
}

export function matchPlace(places: Place[], query: string): Place | null {
  return matchPlaces(places, query, 1)[0] ?? null;
}

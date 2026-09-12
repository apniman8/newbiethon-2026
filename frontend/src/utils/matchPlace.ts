import type { Place } from '../types/contracts';

// Loading screen resolves the free-typed destination against the known
// places for the map (docs/PRD.md "출발지·도착지 자유 입력"). Case-insensitive
// substring match against displayName first, then description. No match ->
// null, which the caller turns into a NOT_FOUND RouteServiceError so the
// existing error-state UX (docs/ADR.md ADR-007) covers it.
export function resolveDestination(places: Place[], query: string): Place | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;

  const candidates = places.filter((p) => p.selectableAsDestination);

  return (
    candidates.find((p) => p.displayName.toLowerCase().includes(q)) ??
    candidates.find((p) => p.description.toLowerCase().includes(q)) ??
    null
  );
}

// Node ID -> pixel coordinate on src/assets/seoul-station-map.png (1575x800),
// the official station map image. The backend does not send coordinates
// (see docs/ADR.md ADR-003), so this table is owned and hand-maintained here.
//
// PLACEHOLDER: these positions are illustrative, not yet verified against the
// real annotated map. Update them once the actual node locations are mapped.

export type Point = [number, number];

export const NODE_COORDINATES: Record<string, Point> = {
  'SEOUL-1F-N001': [220, 260],
  'SEOUL-1F-N002': [520, 260],
  'SEOUL-1F-N005': [520, 420],
  'SEOUL-B7-N012': [560, 460],
};

// CRITICAL (docs/ADR.md ADR-008): a miss returns null, never a guessed
// fallback point. MapPane must render its "map unavailable" state rather
// than plot a plausible-looking but wrong location.
export function getNodeCoordinate(nodeId: string): Point | null {
  return NODE_COORDINATES[nodeId] ?? null;
}

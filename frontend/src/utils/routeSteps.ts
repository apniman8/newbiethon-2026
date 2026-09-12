// v1.2 groups the route into segments (one per map image) whose edges carry the
// actual instructions. The guide screen ticks off one thing at a time, so the
// segments are flattened into a single ordered list: one item per edge, plus one
// item for each map handover (docs/ADR.md ADR-015).

import type {
  ImagePoint,
  MovementType,
  RouteResponse,
  RouteNode,
} from '../types/contracts';

export interface MoveStep {
  kind: 'move';
  id: string;
  instruction: string;
  distanceMeters: number;
  movementType: MovementType;
  floorLabel: string;
  /** This edge's own path, normalized 0..1 on its map image. */
  geometry: ImagePoint[];
  /** Every edge of the surrounding segment, for faint context behind the current one. */
  segmentGeometry: ImagePoint[][];
  /** Map image width/height, so normalized points can be drawn without distortion. */
  mapAspect: number;
  /** What the traveller should see when they arrive at the far end. */
  arrivalDescription: string;
}

export interface TransitionStep {
  kind: 'transition';
  id: string;
  instruction: string;
  toMapName: string;
}

export type GuideStep = MoveStep | TransitionStep;

function floorLabel(from: RouteNode | undefined, to: RouteNode | undefined, fallback: string) {
  const a = from?.floor ?? fallback;
  const b = to?.floor ?? fallback;
  return a === b ? a : `${a} → ${b}`;
}

export function toGuideSteps(route: RouteResponse): GuideStep[] {
  const steps: GuideStep[] = [];

  for (const segment of route.segments) {
    if (segment.segmentType === 'TRANSITION') {
      const toMap = route.mapImages.find((m) => m.id === segment.toMapImageId);
      steps.push({
        kind: 'transition',
        id: `transition-${segment.sequence}`,
        instruction: segment.instruction,
        toMapName: toMap?.displayName ?? 'the next map',
      });
      continue;
    }

    const segmentGeometry = segment.edges.map((e) => e.geometry);
    const nodeById = new Map(segment.nodes.map((n) => [n.id, n]));
    const image = route.mapImages.find((m) => m.id === segment.mapImageId);
    const mapAspect =
      image && image.intrinsicHeight > 0 ? image.intrinsicWidth / image.intrinsicHeight : 1;

    for (const edge of segment.edges) {
      const toNode = nodeById.get(edge.toNodeId);
      steps.push({
        kind: 'move',
        id: edge.id,
        instruction: edge.instruction,
        distanceMeters: edge.distanceMeters,
        movementType: edge.movementType,
        floorLabel: floorLabel(nodeById.get(edge.fromNodeId), toNode, segment.floor),
        geometry: edge.geometry,
        segmentGeometry,
        mapAspect,
        arrivalDescription: toNode?.description ?? '',
      });
    }
  }

  return steps;
}

export function remainingDistance(steps: GuideStep[], fromIndex: number): number {
  return steps
    .slice(fromIndex)
    .reduce((sum, s) => sum + (s.kind === 'move' ? s.distanceMeters : 0), 0);
}

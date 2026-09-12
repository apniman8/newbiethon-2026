// v1.2 groups the route into segments (one per map image) whose edges carry the
// actual instructions. The guide screen ticks off one thing at a time, so the
// segments are flattened into a single ordered list: one item per edge, plus one
// item for each map handover (docs/ADR.md ADR-015).

import { getMapAsset } from '../assets/mapImages';
import { shortenLabel } from './format';
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
  /** Which bundled station map to draw behind the route, if we have it. */
  assetKey: string;
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
    const assetKey = image?.assetKey ?? '';
    // The bundled file's real dimensions win over the contract's declared ones:
    // drawing the artwork at a wrong aspect ratio visibly distorts it.
    const asset = getMapAsset(assetKey);
    const mapAspect = asset
      ? asset.width / asset.height
      : image && image.intrinsicHeight > 0
        ? image.intrinsicWidth / image.intrinsicHeight
        : 1;

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
        assetKey,
        arrivalDescription: toNode?.description ?? '',
      });
    }
  }

  return steps;
}

export interface FloorStop {
  floor: string;
  label: string;
}

// A move step's floorLabel is either one floor ("1F") or "from → to". Split
// it back into both sides — the "from" side matters because a TRANSITION
// segment can hand off onto a map whose first node is already on a
// different floor (confirmed against the live backend: a KTX→AREX route can
// go 1F → B1 → [map switch] → B2 → B3 → B7, where the B1→B2 change happens
// invisibly across the transition, not inside any single edge's own label).
function floorsOf(step: GuideStep): { from: string; to: string } | null {
  if (step.kind !== 'move') return null;
  if (step.floorLabel.includes(' → ')) {
    const [from, to] = step.floorLabel.split(' → ');
    return { from, to };
  }
  return { from: step.floorLabel, to: step.floorLabel };
}

// The confirmed design (Guide Screen UX Review.dc.html, id="3") threads a
// short "1F -> B2 -> B7" floor motif through Loading and Guide. There is no
// separate floor field on the route response, so this walks the flattened
// steps and records every point the floor actually changes — including a
// jump that only shows up on the "from" side of the step right after it.
export function floorStops(route: RouteResponse, steps: GuideStep[]): FloorStop[] {
  const stops: FloorStop[] = [{ floor: route.start.floor, label: shortenLabel(route.start.displayName) }];

  for (const step of steps) {
    if (step.kind !== 'move') continue;
    const floors = floorsOf(step);
    if (!floors) continue;

    if (floors.from !== stops[stops.length - 1].floor) {
      stops.push({ floor: floors.from, label: `Floor ${floors.from}` });
    }
    if (floors.to !== stops[stops.length - 1].floor) {
      stops.push({ floor: floors.to, label: shortenLabel(step.arrivalDescription || floors.to) });
    }
  }

  stops[stops.length - 1] = { floor: route.destination.floor, label: route.destination.displayName };
  return stops;
}

// Which floor-stop each step happens on — the floor the traveller is
// standing on while doing it, i.e. the "from" side of a floor-changing step.
// Advances to the "from" stop before recording this step's index (so a step
// starting right after a hidden transition-floor jump is attributed
// correctly), then to the "to" stop afterward, for the steps that follow.
export function floorStopIndices(stops: FloorStop[], steps: GuideStep[]): number[] {
  const indices: number[] = [];
  let current = 0;

  for (const step of steps) {
    const floors = floorsOf(step);
    if (floors) {
      const fromIdx = stops.findIndex((s) => s.floor === floors.from);
      if (fromIdx > current) current = fromIdx;
    }

    indices.push(current);

    if (floors) {
      const toIdx = stops.findIndex((s) => s.floor === floors.to);
      if (toIdx > current) current = toIdx;
    }
  }

  return indices;
}

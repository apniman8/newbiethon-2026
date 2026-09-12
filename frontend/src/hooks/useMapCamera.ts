import { useMemo } from 'react';

// Frames the CURRENT segment (last two points) inside the map viewport so the
// "you are here" marker is never clipped. See docs/UI_GUIDE.md "MapPane".
export interface Camera {
  zoom: number;
  cx: number;
  cy: number;
}

export function computeCamera(
  points: [number, number][],
  viewW: number,
  viewH: number,
  pad: number,
): Camera {
  const [a, b] = points.slice(-2);
  const minX = Math.min(a[0], b[0]);
  const maxX = Math.max(a[0], b[0]);
  const minY = Math.min(a[1], b[1]);
  const maxY = Math.max(a[1], b[1]);
  const zoom = Math.max(
    1,
    Math.min(
      2.6,
      (viewW - pad * 2) / Math.max(maxX - minX, 40),
      (viewH - pad * 2) / Math.max(maxY - minY, 40),
    ),
  );
  return { zoom, cx: (minX + maxX) / 2, cy: (minY + maxY) / 2 };
}

export function useMapCamera(
  points: [number, number][],
  viewW: number,
  viewH: number,
  pad: number,
): Camera {
  return useMemo(
    () => computeCamera(points, viewW, viewH, pad),
    // points is a small array of [number, number]; stringify for a stable dep
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(points), viewW, viewH, pad],
  );
}

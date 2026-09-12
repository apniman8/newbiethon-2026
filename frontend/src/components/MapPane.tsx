import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle, G, Image as SvgImage, Path } from 'react-native-svg';

import { colors, radius } from '../theme/tokens';
import { getMapAsset } from '../assets/mapImages';
import { useReducedMotion } from '../hooks/useReducedMotion';
import type { ImagePoint } from '../types/contracts';

const AnimatedPath = Animated.createAnimatedComponent(Path);

// v1.2 hands us normalized 0..1 coordinates per map image (docs/ADR.md ADR-014).
// Those coordinates span the whole image, so in this SVG's units the map covers
// exactly x 0..mapAspect, y 0..1 — placing it there makes the artwork and the
// route share one space, and the viewBox zoom applies to both. A map we don't
// have bundled simply leaves the panel empty behind the route.
export interface MapPaneProps {
  /** The current step's own path. */
  geometry: ImagePoint[];
  /** Every path in the same segment, drawn faintly for context. */
  segmentGeometry: ImagePoint[][];
  /** Map image width/height, so the shape is not stretched. */
  mapAspect: number;
  /** Contract assetKey for the station map to draw behind the route. */
  assetKey?: string;
  /** Caps the panel's height (e.g. so the zoomed view doesn't outgrow the screen). */
  maxHeight?: number;
}

// Share of the bounding box kept as breathing room, plus a fixed floor. Wide
// enough that the panel reads as "here's the map, zoomed toward this step"
// rather than a tight, seemingly-cropped snippet of the artwork.
const PAD = 0.35;
const PAD_FLOOR = 0.12;

function toPath(points: ImagePoint[], aspect: number): string {
  return points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${(p.x * aspect).toFixed(4)} ${p.y.toFixed(4)}`)
    .join(' ');
}

function viewBox(all: ImagePoint[][], aspect: number): string {
  const points = all.flat();
  if (points.length === 0) return `0 0 ${aspect} 1`;

  const xs = points.map((p) => p.x * aspect);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  // A straight segment has zero extent on one axis; keep a floor so it still frames.
  const w = Math.max(maxX - minX, 0.12);
  const h = Math.max(maxY - minY, 0.12);
  const padX = w * PAD + PAD_FLOOR;
  const padY = h * PAD + PAD_FLOOR;

  return `${minX - padX} ${minY - padY} ${w + padX * 2} ${h + padY * 2}`;
}

// Sizes itself from its own measured width and the map image's real aspect
// ratio, rather than a fixed height guessed independently of that width —
// a mismatched panel aspect is exactly what made "slice" crop oddly instead
// of just filling the frame cleanly.
export function MapPane({ geometry, segmentGeometry, mapAspect, assetKey, maxHeight }: MapPaneProps) {
  const reducedMotion = useReducedMotion();
  const dashOffset = useRef(new Animated.Value(0)).current;
  const [panelWidth, setPanelWidth] = useState(0);

  useEffect(() => {
    // react-native-svg's animated Path emits a runtime error on React Native Web.
    // Keep the route visible there as a static dashed line; native keeps the motion.
    if (reducedMotion || Platform.OS === 'web') return;
    const loop = Animated.loop(
      Animated.timing(dashOffset, {
        toValue: -0.28,
        duration: 1100,
        easing: Easing.linear,
        useNativeDriver: false, // strokeDashoffset is not a native-driver prop
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [reducedMotion, dashOffset]);

  const onLayout = (e: LayoutChangeEvent) => setPanelWidth(e.nativeEvent.layout.width);
  const height = panelWidth > 0 ? Math.min(panelWidth / mapAspect, maxHeight ?? Infinity) : 0;

  const asset = getMapAsset(assetKey);
  const here = geometry[geometry.length - 1];
  const start = geometry[0];
  const box = viewBox(segmentGeometry.length > 0 ? segmentGeometry : [geometry], mapAspect);
  // Stroke widths are in viewBox units, which shrink as the frame zooms in.
  const unit = height > 0 ? Math.max(...box.split(' ').slice(2).map(Number)) / height : 0;

  return (
    <View style={styles.panel} onLayout={onLayout}>
      {height > 0 && (
        <View style={{ height }}>
          {/* "slice" fills the panel edge-to-edge (like object-fit: cover)
              instead of letterboxing — the map should read as a full photo,
              not a postage stamp floating in empty space. */}
          <Svg width="100%" height="100%" viewBox={box} preserveAspectRatio="xMidYMid slice">
            <G>
              {asset && (
                <SvgImage
                  href={asset.source}
                  x={0}
                  y={0}
                  width={mapAspect}
                  height={1}
                  preserveAspectRatio="none"
                />
              )}
              {segmentGeometry.map((path, i) => (
                <Path
                  key={i}
                  d={toPath(path, mapAspect)}
                  fill="none"
                  stroke={colors.lineNormalNormal}
                  strokeWidth={unit * 5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
              <Path
                d={toPath(geometry, mapAspect)}
                fill="none"
                stroke={colors.white}
                strokeWidth={unit * 7}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {Platform.OS === 'web' ? (
                <Path
                  d={toPath(geometry, mapAspect)}
                  fill="none"
                  stroke={colors.primary}
                  strokeWidth={unit * 4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={`${unit * 9} ${unit * 7}`}
                />
              ) : (
                <AnimatedPath
                  d={toPath(geometry, mapAspect)}
                  fill="none"
                  stroke={colors.primary}
                  strokeWidth={unit * 4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={`${unit * 9} ${unit * 7}`}
                  strokeDashoffset={dashOffset}
                />
              )}
              {start && (
                <Circle
                  cx={start.x * mapAspect}
                  cy={start.y}
                  r={unit * 3.5}
                  fill={colors.white}
                  stroke={colors.primary}
                  strokeWidth={unit * 2}
                />
              )}
              {here && (
                <Circle
                  cx={here.x * mapAspect}
                  cy={here.y}
                  r={unit * 5.5}
                  fill={colors.primary}
                  stroke={colors.white}
                  strokeWidth={unit * 2.5}
                />
              )}
            </G>
          </Svg>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    width: '100%',
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.fillAlternative,
    position: 'relative',
  },
});

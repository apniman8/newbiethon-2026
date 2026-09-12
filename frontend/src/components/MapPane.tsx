import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, StyleSheet, Text, View } from 'react-native';
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
  floorLabel: string;
  height?: number;
}

const PAD = 0.08; // share of the bounding box kept as breathing room

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
  const padX = w * PAD + 0.04;
  const padY = h * PAD + 0.04;

  return `${minX - padX} ${minY - padY} ${w + padX * 2} ${h + padY * 2}`;
}

export function MapPane({
  geometry,
  segmentGeometry,
  mapAspect,
  assetKey,
  floorLabel,
  height = 140,
}: MapPaneProps) {
  const reducedMotion = useReducedMotion();
  const dashOffset = useRef(new Animated.Value(0)).current;

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

  const asset = getMapAsset(assetKey);
  const here = geometry[geometry.length - 1];
  const start = geometry[0];
  const box = viewBox(segmentGeometry.length > 0 ? segmentGeometry : [geometry], mapAspect);
  // Stroke widths are in viewBox units, which shrink as the frame zooms in.
  const unit = Math.max(...box.split(' ').slice(2).map(Number)) / height;

  return (
    <View style={[styles.panel, { height }]}>
      <Svg width="100%" height="100%" viewBox={box} preserveAspectRatio="xMidYMid meet">
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
              strokeWidth={unit * 9}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          <Path
            d={toPath(geometry, mapAspect)}
            fill="none"
            stroke={colors.white}
            strokeWidth={unit * 11}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {Platform.OS === 'web' ? (
            <Path
              d={toPath(geometry, mapAspect)}
              fill="none"
              stroke={colors.primary}
              strokeWidth={unit * 6}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={`${unit * 14} ${unit * 11}`}
            />
          ) : (
            <AnimatedPath
              d={toPath(geometry, mapAspect)}
              fill="none"
              stroke={colors.primary}
              strokeWidth={unit * 6}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={`${unit * 14} ${unit * 11}`}
              strokeDashoffset={dashOffset}
            />
          )}
          {start && (
            <Circle
              cx={start.x * mapAspect}
              cy={start.y}
              r={unit * 5}
              fill={colors.white}
              stroke={colors.primary}
              strokeWidth={unit * 3}
            />
          )}
          {here && (
            <Circle
              cx={here.x * mapAspect}
              cy={here.y}
              r={unit * 8}
              fill={colors.primary}
              stroke={colors.white}
              strokeWidth={unit * 4}
            />
          )}
        </G>
      </Svg>
      <View style={styles.floorBadge}>
        <Text style={styles.floorBadgeText}>{floorLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.fillAlternative,
    position: 'relative',
  },
  floorBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.background,
  },
  floorBadgeText: {
    color: colors.labelNeutral,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

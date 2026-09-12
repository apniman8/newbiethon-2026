import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { colors, radius } from '../theme/tokens';
import type { Point } from '../data/nodeCoordinates';
import { computeCamera } from '../hooks/useMapCamera';
import { useReducedMotion } from '../hooks/useReducedMotion';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const IMAGE_W = 1575;
const IMAGE_H = 800;
const VIEW_W = 358;
const VIEW_H = 360;
const PAD = 72; // room for the "you are here" halo, see docs/UI_GUIDE.md MapPane

export interface MapPaneProps {
  // Cumulative path up to and including the current step. An entry is null
  // when its nodeId is missing from nodeCoordinates.ts (docs/ADR.md ADR-008).
  points: (Point | null)[];
  floorLabel: string;
}

function pathD(points: Point[]): string {
  return points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ');
}

function arrowHeadD([x, y]: Point, angleDeg: number): string {
  const size = 12;
  const rad = (angleDeg * Math.PI) / 180;
  const tip: Point = [x + Math.cos(rad) * size, y + Math.sin(rad) * size];
  const backAngle1 = rad + (Math.PI * 2.6) / 3;
  const backAngle2 = rad - (Math.PI * 2.6) / 3;
  const back1: Point = [x + Math.cos(backAngle1) * size, y + Math.sin(backAngle1) * size];
  const back2: Point = [x + Math.cos(backAngle2) * size, y + Math.sin(backAngle2) * size];
  return `M ${tip[0]} ${tip[1]} L ${back1[0]} ${back1[1]} L ${back2[0]} ${back2[1]} Z`;
}

export function MapPane({ points, floorLabel }: MapPaneProps) {
  const reducedMotion = useReducedMotion();
  const [imageFailed, setImageFailed] = useState(false);
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const dashOffset = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  // CRITICAL (docs/ADR.md ADR-008): a gap in the CURRENT segment means we
  // don't silently plot a guessed location — show "map unavailable" instead.
  const currentSegment = points.slice(-2);
  const hasCoordinateGap = currentSegment.length < 2 || currentSegment.some((p) => p === null);
  const showPlaceholder = hasCoordinateGap || imageFailed;

  const resolvedPoints = points.filter((p): p is Point => p !== null);
  const here: Point = resolvedPoints[resolvedPoints.length - 1] ?? [0, 0];
  const prevPoint: Point = resolvedPoints.length > 1 ? resolvedPoints[resolvedPoints.length - 2] : here;
  const segmentAngle =
    (Math.atan2(here[1] - prevPoint[1], here[0] - prevPoint[0]) * 180) / Math.PI;

  useEffect(() => {
    if (showPlaceholder) return;

    const cam = computeCamera(resolvedPoints, VIEW_W, VIEW_H, PAD);
    const targetX = VIEW_W / 2 - cam.cx * cam.zoom;
    const targetY = VIEW_H / 2 - cam.cy * cam.zoom;

    if (reducedMotion) {
      translateX.setValue(targetX);
      translateY.setValue(targetY);
      scale.setValue(cam.zoom);
      return;
    }

    Animated.parallel([
      Animated.timing(translateX, {
        toValue: targetX,
        duration: 500,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: targetY,
        duration: 500,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: cam.zoom,
        duration: 500,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true,
      }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(points), reducedMotion, showPlaceholder]);

  useEffect(() => {
    if (reducedMotion || showPlaceholder) return;

    const dashLoop = Animated.loop(
      Animated.timing(dashOffset, {
        toValue: -28,
        duration: 1100,
        easing: Easing.linear,
        useNativeDriver: false, // strokeDashoffset isn't supported by the native driver
      }),
    );
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ]),
    );
    dashLoop.start();
    pulseLoop.start();
    return () => {
      dashLoop.stop();
      pulseLoop.stop();
    };
  }, [reducedMotion, showPlaceholder]);

  const pulseScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.4] });
  const pulseOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.26, 0.08] });

  return (
    <View style={styles.panel}>
      {showPlaceholder ? (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderGlyph}>▦</Text>
          <Text style={styles.placeholderText}>Map unavailable for this step</Text>
        </View>
      ) : (
        <Animated.View
          style={[
            styles.layer,
            {
              transform: [{ translateX }, { translateY }, { scale }],
            },
          ]}
        >
          <Image
            source={require('../assets/seoul-station-map.png')}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImageFailed(true)}
          />
          <Svg width={IMAGE_W} height={IMAGE_H} viewBox={`0 0 ${IMAGE_W} ${IMAGE_H}`} style={StyleSheet.absoluteFill}>
            <Path
              d={pathD(resolvedPoints)}
              fill="none"
              stroke="rgba(255,255,255,0.9)"
              strokeWidth={13}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <AnimatedPath
              d={pathD(resolvedPoints)}
              fill="none"
              stroke={colors.primary}
              strokeWidth={7}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="16 14"
              strokeDashoffset={dashOffset}
            />
            <Path d={arrowHeadD(here, segmentAngle)} fill={colors.primary} />
            <AnimatedCircle
              cx={here[0]}
              cy={here[1]}
              r={20}
              fill={colors.primary}
              opacity={pulseOpacity}
              originX={here[0]}
              originY={here[1]}
              scale={pulseScale}
            />
            <Circle cx={here[0]} cy={here[1]} r={9} fill={colors.primary} stroke="#FFFFFF" strokeWidth={4} />
          </Svg>
        </Animated.View>
      )}
      <View style={styles.floorBadge}>
        <Text style={styles.floorBadgeText}>{floorLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: 'relative',
    width: VIEW_W,
    height: VIEW_H,
    borderRadius: radius.xxl,
    overflow: 'hidden',
    backgroundColor: '#171A20',
    alignSelf: 'center',
  },
  layer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: IMAGE_W,
    height: IMAGE_H,
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: IMAGE_W,
    height: IMAGE_H,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  placeholderGlyph: {
    fontSize: 28,
    color: 'rgba(255,255,255,0.35)',
  },
  placeholderText: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.55)',
  },
  floorBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(15,17,21,0.78)',
  },
  floorBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

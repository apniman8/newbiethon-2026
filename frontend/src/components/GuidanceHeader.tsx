import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius } from '../theme/tokens';
import type { RouteStep } from '../types/contracts';
import { ARROW_GLYPHS, formatDistance } from '../utils/format';

export interface GuidanceHeaderProps {
  step: RouteStep;
  stepNumber: number;
  totalSteps: number;
}

export function GuidanceHeader({ step, stepNumber, totalSteps }: GuidanceHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.arrowTile}>
          <Text style={styles.arrowGlyph}>{ARROW_GLYPHS[step.direction]}</Text>
        </View>
        <View style={styles.textCol}>
          <Text style={styles.movementLabel}>
            {step.movementType} · STEP {stepNumber} OF {totalSteps}
          </Text>
          <Text style={styles.distance}>{formatDistance(step.distanceMeters)}</Text>
        </View>
      </View>
      <Text style={styles.instruction}>{step.instruction}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  arrowTile: {
    width: 52,
    height: 52,
    borderRadius: radius.xxl,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowGlyph: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.white,
  },
  textCol: {
    flexShrink: 1,
    gap: 3,
  },
  movementLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: 'rgba(255,255,255,0.5)',
  },
  distance: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
  },
  instruction: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
    letterSpacing: -0.1,
    color: colors.white,
  },
});

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';

import { colors, radius, spacing } from '../theme/tokens';
import { MOVEMENT_LABELS } from '../utils/format';
import type { GuideStep } from '../utils/routeSteps';

export interface GuideStepRowProps {
  step: GuideStep;
  index: number;
  state: 'done' | 'upcoming';
  onPress?: () => void;
}

// A collapsed line in the checklist — either already ticked off or still ahead.
export function GuideStepRow({ step, index, state, onPress }: GuideStepRowProps) {
  const done = state === 'done';
  const meta =
    step.kind === 'move'
      ? `${MOVEMENT_LABELS[step.movementType]} · ${step.floorLabel}`
      : 'Map changes';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !onPress }}
      onPress={onPress}
      style={[styles.row, done ? styles.rowDone : styles.rowUpcoming]}
    >
      {done ? (
        <View style={styles.checkBadge}>
          <Svg width={14} height={14} viewBox="0 0 24 24">
            <Polyline
              points="20 6 9 17 4 12"
              stroke={colors.white}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </Svg>
        </View>
      ) : (
        <View style={styles.numberBadge}>
          <Text style={styles.numberBadgeText}>{index + 1}</Text>
        </View>
      )}

      <View style={styles.textCol}>
        <Text style={[styles.instruction, done && styles.instructionDone]} numberOfLines={2}>
          {step.instruction}
        </Text>
        <Text style={styles.meta}>{meta}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.xl,
  },
  rowDone: {
    backgroundColor: colors.fillAlternative,
  },
  rowUpcoming: {
    borderWidth: 1,
    borderColor: colors.lineNormalNormal,
  },
  checkBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.statusPositive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: '#D7DBE2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.labelAlternative,
  },
  textCol: {
    flexShrink: 1,
    gap: 2,
  },
  instruction: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 21,
    color: colors.labelStrong,
  },
  instructionDone: {
    color: colors.labelAlternative,
    textDecorationLine: 'line-through',
  },
  meta: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.labelAlternative,
  },
});

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Polyline } from 'react-native-svg';

import { MapPane } from './MapPane';
import { MovementIcon } from './MovementIcon';
import { PrimaryButton } from './PrimaryButton';
import { colors, radius, spacing } from '../theme/tokens';
import { formatDistance, MOVEMENT_LABELS } from '../utils/format';
import type { GuideStep } from '../utils/routeSteps';

export interface GuideStepCardProps {
  step: GuideStep;
  index: number;
  isLast: boolean;
  onDone: () => void;
}

// The one step the traveller is on right now: the only expanded card in the
// checklist (docs/UI_GUIDE.md "04 · Guide").
export function GuideStepCard({ step, index, isLast, onDone }: GuideStepCardProps) {
  const headline =
    step.kind === 'move'
      ? `${MOVEMENT_LABELS[step.movementType]} · ${formatDistance(step.distanceMeters)}`
      : 'Switch map';

  return (
    <View style={styles.card}>
      <View style={styles.headRow}>
        <View style={styles.iconTile}>
          {step.kind === 'move' ? (
            <MovementIcon movementType={step.movementType} size={26} color={colors.white} />
          ) : (
            <Svg width={26} height={26} viewBox="0 0 24 24">
              <Polyline
                points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"
                stroke={colors.white}
                strokeWidth={1.9}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <Path
                d="M 8 2 L 8 18"
                stroke={colors.white}
                strokeWidth={1.9}
                strokeLinecap="round"
                fill="none"
              />
              <Path
                d="M 16 6 L 16 22"
                stroke={colors.white}
                strokeWidth={1.9}
                strokeLinecap="round"
                fill="none"
              />
            </Svg>
          )}
        </View>
        <View style={styles.headText}>
          <Text style={styles.stepLabel}>STEP {index + 1} — NOW</Text>
          <Text style={styles.headline}>{headline}</Text>
        </View>
      </View>

      <Text style={styles.instruction}>{step.instruction}</Text>

      {step.kind === 'move' ? (
        <>
          {step.arrivalDescription.length > 0 && (
            <View style={styles.callout}>
              <Text style={styles.calloutLabel}>WHEN YOU GET THERE</Text>
              <Text style={styles.calloutBody}>{step.arrivalDescription}</Text>
            </View>
          )}
          <MapPane
            geometry={step.geometry}
            segmentGeometry={step.segmentGeometry}
            mapAspect={step.mapAspect}
            floorLabel={step.floorLabel}
          />
        </>
      ) : (
        <View style={styles.callout}>
          <Text style={styles.calloutLabel}>NEXT MAP</Text>
          <Text style={styles.calloutBody}>{step.toMapName}</Text>
        </View>
      )}

      <PrimaryButton label={isLast ? "I've arrived" : "Done — I'm here"} onPress={onDone} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 14,
    padding: 18,
    borderRadius: radius.xxl,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.background,
  },
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconTile: {
    width: 48,
    height: 48,
    borderRadius: radius.xl,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headText: {
    flexShrink: 1,
    gap: 2,
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: colors.primary,
  },
  headline: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: colors.labelStrong,
  },
  instruction: {
    fontSize: 16,
    lineHeight: 23,
    color: colors.labelNeutral,
  },
  callout: {
    gap: 4,
    padding: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.calloutBackground,
  },
  calloutLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: colors.primary,
  },
  calloutBody: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.labelNeutral,
  },
  spacer: {
    height: spacing.xs,
  },
});

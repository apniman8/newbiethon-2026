import React, { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { MapPane } from './MapPane';
import { PrimaryButton } from './PrimaryButton';
import { colors, radius, spacing } from '../theme/tokens';
import { MOVEMENT_LABELS } from '../utils/format';
import { fadeScrollbarOnScroll } from '../utils/webScrollTheme';
import type { GuideStep } from '../utils/routeSteps';

export interface GuideStepCardProps {
  step: GuideStep;
  index: number;
  total: number;
  floorLabel: string;
  isLast: boolean;
  /** Omit to render this read-only — used when reviewing an already-done step. */
  onDone?: () => void;
}

// The expanded view of one step: the current step while it's in progress, or
// a past/upcoming step the traveller tapped to look at again
// (docs/UI_GUIDE.md "04 · Guide"). The map shows by default and collapses
// behind a toggle — text is still the primary way to navigate, but the map
// should be a glance away, not a tap away (docs/PRD.md, map as secondary aid).
export function GuideStepCard({ step, index, total, floorLabel, isLast, onDone }: GuideStepCardProps) {
  const [showMap, setShowMap] = useState(true);
  const [zoomed, setZoomed] = useState(false);
  const zoomScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!zoomed) return;
    return fadeScrollbarOnScroll(zoomScrollRef.current);
  }, [zoomed]);

  const eyebrow =
    step.kind === 'move'
      ? `STEP ${index + 1} OF ${total} · ${floorLabel} · ${MOVEMENT_LABELS[step.movementType].toUpperCase()}`
      : `STEP ${index + 1} OF ${total} · MAP CHANGE`;

  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.instruction}>{step.instruction}</Text>

      {step.kind === 'move' ? (
        <>
          {step.arrivalDescription.length > 0 && (
            <View style={styles.callout}>
              <Text style={styles.calloutLabel}>WHEN YOU GET THERE</Text>
              <Text style={styles.calloutBody}>{step.arrivalDescription}</Text>
            </View>
          )}

          {showMap && (
            <View style={styles.mapBlock}>
              {/* The floor badge used to float on top of the photo itself —
                  moved beside it instead so it doesn't cover any of the map. */}
              <View style={styles.mapFloorRow}>
                <View style={styles.mapFloorPill}>
                  <Text style={styles.mapFloorPillText}>{step.floorLabel}</Text>
                </View>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Enlarge map for this step"
                onPress={() => setZoomed(true)}
              >
                <MapPane
                  geometry={step.geometry}
                  segmentGeometry={step.segmentGeometry}
                  mapAspect={step.mapAspect}
                  assetKey={step.assetKey}
                />
              </Pressable>

              <Modal visible={zoomed} transparent animationType="fade" onRequestClose={() => setZoomed(false)}>
                <View style={styles.zoomBackdrop}>
                  <ScrollView
                    ref={zoomScrollRef}
                    contentContainerStyle={styles.zoomScrollContent}
                    showsVerticalScrollIndicator={false}
                  >
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Close enlarged map"
                      onPress={() => setZoomed(false)}
                      style={styles.zoomCard}
                    >
                      <MapPane
                        geometry={step.geometry}
                        segmentGeometry={step.segmentGeometry}
                        mapAspect={step.mapAspect}
                        assetKey={step.assetKey}
                      />
                    </Pressable>
                  </ScrollView>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Close enlarged map"
                    onPress={() => setZoomed(false)}
                    style={styles.zoomClose}
                  >
                    <Text style={styles.zoomCloseText}>✕</Text>
                  </Pressable>
                </View>
              </Modal>
            </View>
          )}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={showMap ? 'Hide map for this step' : 'Show map for this step'}
            onPress={() => setShowMap((v) => !v)}
            hitSlop={8}
          >
            <Text style={styles.mapToggle}>{showMap ? 'Hide map for this step' : 'Show map for this step'}</Text>
          </Pressable>
        </>
      ) : (
        <View style={styles.callout}>
          <Text style={styles.calloutLabel}>NEXT MAP</Text>
          <Text style={styles.calloutBody}>{step.toMapName}</Text>
        </View>
      )}

      {onDone && <PrimaryButton label={isLast ? "I've arrived" : "Done — I'm here"} onPress={onDone} />}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    // The confirmed design shows the active step as plain content, not a
    // bordered card — the checklist rows above/below still carry their own
    // treatment (docs/UI_GUIDE.md "04 · Guide").
    gap: 18,
    paddingVertical: spacing.lg,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: colors.primary,
  },
  instruction: {
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 35,
    letterSpacing: -0.6,
    color: colors.labelStrong,
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
  mapBlock: { gap: spacing.sm },
  mapFloorRow: { flexDirection: 'row' },
  mapFloorPill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.fillAlternative,
  },
  mapFloorPillText: {
    color: colors.labelNeutral,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  mapToggle: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: colors.labelAlternative,
    textDecorationLine: 'underline',
    paddingVertical: spacing.xs,
  },
  zoomBackdrop: {
    flex: 1,
    backgroundColor: colors.modalBackdrop,
  },
  zoomScrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  zoomCard: {
    width: '100%',
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  zoomClose: {
    position: 'absolute',
    top: 48,
    right: 24,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.overlayButton,
  },
  zoomCloseText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});

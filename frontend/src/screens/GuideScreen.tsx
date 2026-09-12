import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Line } from 'react-native-svg';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { GuideStepCard } from '../components/GuideStepCard';
import { GuideStepRow } from '../components/GuideStepRow';
import { colors, radius, spacing } from '../theme/tokens';
import { floorStopIndices, floorStops, toGuideSteps } from '../utils/routeSteps';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Guide'>;

// docs/ADR.md ADR-015: the whole route stays on screen as a checklist. There is
// no indoor positioning, so the app cannot know where the traveller is — it
// asks them to tick each step off instead of pretending to track them.
// All hooks run unconditionally; the "no steps" case is the final early return.
//
// Header follows the confirmed design (Guide Screen UX Review.dc.html,
// id="3"): a close button plus a row of floor chips (2b's motif) replaces the
// old "N of M done" text line.
export function GuideScreen({ route: navRoute, navigation }: Props) {
  const { route } = navRoute.params;
  const [doneCount, setDoneCount] = useState(0);
  const doneCountRef = useRef(doneCount);
  doneCountRef.current = doneCount;

  // A completed step tapped open for a second look — read-only, no effect
  // on progress. Cleared whenever the active step changes.
  const [reviewId, setReviewId] = useState<string | null>(null);

  const scrollRef = useRef<ScrollView>(null);
  const activeOffset = useRef(0);

  const steps = useMemo(() => toGuideSteps(route), [route]);
  const stops = useMemo(() => floorStops(route, steps), [route, steps]);
  const stepStops = useMemo(() => floorStopIndices(stops, steps), [stops, steps]);

  const hasSteps = steps.length > 0;
  const activeIndex = Math.min(doneCount, Math.max(steps.length - 1, 0));
  const activeStep = hasSteps ? steps[activeIndex] : null;
  const isLast = activeIndex === steps.length - 1;
  const activeStopIndex = stepStops[activeIndex] ?? 0;

  useEffect(() => {
    if (!hasSteps) {
      navigation.replace('Arrived', { route });
    }
  }, [hasSteps, navigation, route]);

  // docs/ADR.md ADR-010: confirm before losing progress past the first step.
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (doneCountRef.current === 0) return;
      e.preventDefault();
      Alert.alert('Leave this guide?', "Your progress won't be saved.", [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Leave', style: 'destructive', onPress: () => navigation.dispatch(e.data.action) },
      ]);
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (activeStep) {
      AccessibilityInfo.announceForAccessibility(activeStep.instruction);
    }
  }, [activeStep]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: Math.max(activeOffset.current - 12, 0), animated: true });
  }, [activeIndex]);

  if (!hasSteps || !activeStep) {
    return <SafeAreaView style={styles.safeArea} />;
  }

  const advance = () => {
    setReviewId(null);
    if (isLast) {
      // Finished — replace, not navigate: leaving Guide underneath Arrived
      // means its beforeRemove progress-guard (ADR-010) is still armed and
      // would intercept "Plan another transfer"'s later navigation.reset().
      navigation.replace('Arrived', { route });
    } else {
      setDoneCount((n) => Math.min(steps.length - 1, n + 1));
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Leave this guide"
          onPress={() => navigation.goBack()}
          style={styles.closeButton}
        >
          <Svg width={16} height={16} viewBox="0 0 24 24">
            <Line x1="18" y1="6" x2="6" y2="18" stroke={colors.labelNeutral} strokeWidth={2} strokeLinecap="round" />
            <Line x1="6" y1="6" x2="18" y2="18" stroke={colors.labelNeutral} strokeWidth={2} strokeLinecap="round" />
          </Svg>
        </Pressable>

        <View style={styles.chipsRow}>
          {stops.map((stop, i) => {
            const state = i < activeStopIndex ? 'done' : i === activeStopIndex ? 'current' : 'upcoming';
            return (
              <View
                key={`${stop.floor}-${i}`}
                style={[
                  styles.chip,
                  state === 'done' && styles.chipDone,
                  state === 'current' && styles.chipCurrent,
                  state === 'upcoming' && styles.chipUpcoming,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    state === 'done' && styles.chipTextDone,
                    state === 'current' && styles.chipTextCurrent,
                    state === 'upcoming' && styles.chipTextUpcoming,
                  ]}
                >
                  {state === 'done' ? `✓ ${stop.floor}` : state === 'current' ? `● ${stop.floor}` : stop.floor}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.closeButton} />
      </View>

      <ScrollView ref={scrollRef} contentContainerStyle={styles.list}>
        {steps.slice(0, activeIndex).map((step, i) => (
          <View key={step.id}>
            <GuideStepRow
              step={step}
              index={i}
              state="done"
              onPress={() => setReviewId((current) => (current === step.id ? null : step.id))}
            />
            {reviewId === step.id && (
              <View style={styles.reviewCard}>
                <GuideStepCard
                  key={step.id}
                  step={step}
                  index={i}
                  total={steps.length}
                  floorLabel={stops[stepStops[i]]?.floor ?? ''}
                  isLast={false}
                />
              </View>
            )}
          </View>
        ))}

        <View onLayout={(e) => (activeOffset.current = e.nativeEvent.layout.y)}>
          <GuideStepCard
            key={activeStep.id}
            step={activeStep}
            index={activeIndex}
            total={steps.length}
            floorLabel={stops[activeStopIndex]?.floor ?? ''}
            isLast={isLast}
            onDone={advance}
          />
        </View>

        {steps.slice(activeIndex + 1).map((step, i) => (
          <GuideStepRow
            key={step.id}
            step={step}
            index={activeIndex + 1 + i}
            state="upcoming"
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.lineNormalNormal,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.fillAlternative,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipsRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipDone: {
    backgroundColor: colors.fillAlternative,
    borderColor: colors.fillAlternative,
  },
  chipCurrent: {
    backgroundColor: colors.background,
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  chipUpcoming: {
    backgroundColor: colors.background,
    borderColor: colors.lineNormalNormal,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  chipTextDone: { color: colors.labelAlternative },
  chipTextCurrent: { color: colors.primary },
  chipTextUpcoming: { color: colors.labelAlternative },
  list: {
    padding: spacing.xl,
    gap: 10,
  },
  reviewCard: {
    marginTop: 4,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    borderRadius: radius.xl,
    backgroundColor: colors.fillAlternative,
  },
});

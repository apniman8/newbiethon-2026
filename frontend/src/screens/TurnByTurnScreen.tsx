import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { GuidanceHeader } from '../components/GuidanceHeader';
import { LandmarkCallout } from '../components/LandmarkCallout';
import { MapPane } from '../components/MapPane';
import { NavButton } from '../components/NavButton';
import { ProgressTrack } from '../components/ProgressTrack';
import { getNodeCoordinate } from '../data/nodeCoordinates';
import { spacing } from '../theme/tokens';
import { formatFloorLabel } from '../utils/format';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'TurnByTurn'>;

// docs/ADR.md ADR-009: a route with zero steps must never be indexed into.
// All hooks below run unconditionally on every render (Rules of Hooks) — the
// "no steps" case is only handled in the final early return, after every
// hook has already been called.
export function TurnByTurnScreen({ route: navRoute, navigation }: Props) {
  const { route } = navRoute.params;
  const [stepIndex, setStepIndex] = useState(0);
  const stepIndexRef = useRef(stepIndex);
  stepIndexRef.current = stepIndex;

  const hasSteps = route.steps.length > 0;
  const safeIndex = hasSteps ? Math.min(stepIndex, route.steps.length - 1) : 0;
  const currentStep = hasSteps ? route.steps[safeIndex] : null;

  useEffect(() => {
    if (!hasSteps) {
      navigation.replace('Arrived', { route });
    }
  }, [hasSteps, navigation, route]);

  // docs/ADR.md ADR-010: confirm before losing progress past the first step.
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (stepIndexRef.current === 0) return;
      e.preventDefault();
      Alert.alert(
        'Leave this guide?',
        "Your progress won't be saved.",
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Leave', style: 'destructive', onPress: () => navigation.dispatch(e.data.action) },
        ],
      );
    });
    return unsubscribe;
  }, [navigation]);

  const fullPath = useMemo(
    () => [route.start.nodeId, ...route.steps.map((s) => s.toNodeId)],
    [route],
  );

  const points = useMemo(
    () => fullPath.slice(0, safeIndex + 2).map(getNodeCoordinate),
    [fullPath, safeIndex],
  );

  useEffect(() => {
    if (currentStep) {
      AccessibilityInfo.announceForAccessibility(currentStep.instruction);
    }
  }, [currentStep]);

  if (!hasSteps || !currentStep) {
    return <SafeAreaView style={styles.safeArea} />;
  }

  const isFirst = safeIndex === 0;
  const isLast = safeIndex === route.steps.length - 1;

  const goNext = () => {
    if (isLast) {
      navigation.navigate('Arrived', { route });
    } else {
      setStepIndex((i) => Math.min(route.steps.length - 1, i + 1));
    }
  };

  const goPrev = () => setStepIndex((i) => Math.max(0, i - 1));

  return (
    <SafeAreaView style={styles.safeArea}>
      <ProgressTrack current={safeIndex} total={route.steps.length} />

      <View style={styles.mapWrap}>
        <MapPane
          points={points}
          floorLabel={formatFloorLabel(currentStep.fromFloor, currentStep.toFloor)}
        />
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <GuidanceHeader
          step={currentStep}
          stepNumber={safeIndex + 1}
          totalSteps={route.steps.length}
        />
        <LandmarkCallout landmark={currentStep.landmark} />
      </ScrollView>

      <View style={styles.footer}>
        <NavButton variant="prev" disabled={isFirst} onPress={goPrev} />
        <NavButton
          variant={isLast ? 'finish' : 'next'}
          onPress={goNext}
          label={isLast ? "I'm here" : 'Next step'}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F1115',
  },
  mapWrap: {
    marginHorizontal: 16,
  },
  body: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    gap: spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.lg,
  },
});

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
import { colors, spacing } from '../theme/tokens';
import { remainingDistance, toGuideSteps } from '../utils/routeSteps';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Guide'>;

// docs/ADR.md ADR-015: the whole route stays on screen as a checklist. There is
// no indoor positioning, so the app cannot know where the traveller is — it
// asks them to tick each step off instead of pretending to track them.
// All hooks run unconditionally; the "no steps" case is the final early return.
export function GuideScreen({ route: navRoute, navigation }: Props) {
  const { route } = navRoute.params;
  const [doneCount, setDoneCount] = useState(0);
  const doneCountRef = useRef(doneCount);
  doneCountRef.current = doneCount;

  const scrollRef = useRef<ScrollView>(null);
  const activeOffset = useRef(0);

  const steps = useMemo(() => toGuideSteps(route), [route]);
  const hasSteps = steps.length > 0;
  const activeIndex = Math.min(doneCount, Math.max(steps.length - 1, 0));
  const activeStep = hasSteps ? steps[activeIndex] : null;
  const isLast = activeIndex === steps.length - 1;

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
    if (isLast) {
      navigation.navigate('Arrived', { route });
    } else {
      setDoneCount((n) => Math.min(steps.length - 1, n + 1));
    }
  };

  const metersLeft = remainingDistance(steps, activeIndex);

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
        <View style={styles.headerText}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            To {route.destination.displayName}
          </Text>
          <Text style={styles.headerMeta}>
            {activeIndex} of {steps.length} done · {metersLeft} m left
          </Text>
        </View>
      </View>

      <ScrollView ref={scrollRef} contentContainerStyle={styles.list}>
        {steps.slice(0, activeIndex).map((step, i) => (
          <GuideStepRow key={step.id} step={step} index={i} state="done" />
        ))}

        <View onLayout={(e) => (activeOffset.current = e.nativeEvent.layout.y)}>
          <GuideStepCard
            step={activeStep}
            index={activeIndex}
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
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
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
  headerText: {
    flexShrink: 1,
    gap: 1,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.labelStrong,
  },
  headerMeta: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.labelAlternative,
  },
  list: {
    padding: spacing.xl,
    gap: 10,
  },
});

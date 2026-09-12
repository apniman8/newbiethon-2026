import React from 'react';
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { PrimaryButton } from '../components/PrimaryButton';
import { colors, spacing } from '../theme/tokens';
import { formatDuration } from '../utils/format';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Arrived'>;

// Follows the confirmed design's landmark-first tone (Guide Screen UX Review
// .dc.html, id="3"): one flowing sentence instead of a stats table.
//
// Note: the reference design's copy is "…The next train leaves in about 6
// minutes, per the timetable." — a specific ETA. facilityDataStatus is
// STATIC (docs/ARCHITECTURE.md), so there is no real number backing that;
// this points travellers at the real board instead of showing a fabricated
// countdown (this exact honesty gap is critique ⑪ in the review doc itself).
export function ArrivedScreen({ route: navRoute, navigation }: Props) {
  const { route } = navRoute.params;
  const { minutes } = formatDuration(route.summary.estimatedDurationSeconds);
  const isPlatform = /platform/i.test(route.destination.displayName);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.checkCircle}>
          <Text style={styles.checkGlyph}>✓</Text>
        </View>
        <Text style={styles.title}>{isPlatform ? "You're on the platform." : "You've arrived."}</Text>
        <Text style={styles.description}>
          {route.destination.displayName}. {route.summary.totalDistanceMeters} m walked, about {minutes} minute
          {minutes === 1 ? '' : 's'}. Check the overhead board for departure times.
        </Text>
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          label="Plan another transfer"
          onPress={() =>
            // docs/ADR.md ADR-011: fully clear the finished guide from the
            // back stack instead of popToTop, so it can't be swiped back into.
            navigation.reset({ index: 0, routes: [{ name: 'OriginInput' }] })
          }
        />
        <Pressable
          accessibilityRole="button"
          onPress={() => Alert.alert('Thanks', 'Reporting a wrong turn isn’t wired up yet in this MVP.')}
          hitSlop={8}
        >
          <Text style={styles.reportLink}>Report a wrong turn</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xxxl,
    gap: spacing.xl,
  },
  checkCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.statusPositive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkGlyph: {
    fontSize: 24,
    color: colors.white,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    lineHeight: 42,
    letterSpacing: -0.7,
    color: colors.labelStrong,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.labelNeutral,
  },
  footer: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  reportLink: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    color: colors.labelAlternative,
    textDecorationLine: 'underline',
  },
});

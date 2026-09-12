import React from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ArrivalSummaryList } from '../components/ArrivalSummaryList';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';
import { colors, spacing } from '../theme/tokens';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Arrived'>;

export function ArrivedScreen({ route: navRoute, navigation }: Props) {
  const { route } = navRoute.params;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.checkCircle}>
          <Text style={styles.checkGlyph}>✓</Text>
        </View>
        <Text style={styles.title}>You've arrived</Text>
        <Text style={styles.description}>
          {route.destination.displayName}. Follow the platform signs and check the
          overhead board before boarding.
        </Text>
        <ArrivalSummaryList
          walkedMeters={route.summary.totalDistanceMeters}
          durationSeconds={route.summary.estimatedDurationSeconds}
        />
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
        <SecondaryButton
          label="Report a wrong turn"
          onPress={() =>
            Alert.alert('Thanks', 'Reporting a wrong turn isn’t wired up yet in this MVP.')
          }
        />
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
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.statusPositive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkGlyph: {
    fontSize: 34,
    color: colors.white,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
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
});

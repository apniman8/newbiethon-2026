import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { PrimaryButton } from '../components/PrimaryButton';
import { ProfileSwitcher } from '../components/ProfileSwitcher';
import { ScreenTopBar } from '../components/ScreenTopBar';
import { TextField } from '../components/TextField';
import { colors, spacing, typography } from '../theme/tokens';
import type { RoutingProfile } from '../types/contracts';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'DestinationInput'>;

export function DestinationInputScreen({ navigation, route }: Props) {
  const { originQuery, originExitNumber } = route.params;
  const [destinationQuery, setDestinationQuery] = useState('');
  const [profile, setProfile] = useState<RoutingProfile>('STANDARD');

  const canContinue = destinationQuery.trim().length > 0;

  const goNext = () => {
    if (!canContinue) return;
    navigation.navigate('Loading', {
      originQuery,
      originExitNumber,
      destinationQuery: destinationQuery.trim(),
      profile,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenTopBar title="Destination" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.mapLabel}>STEP 2 OF 2</Text>
            <Text style={styles.title}>Where are you{'\n'}heading?</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.dotFrom} />
            <View style={styles.summaryText}>
              <Text style={styles.summaryLabel}>FROM</Text>
              <Text style={styles.summaryValue}>
                {originQuery}
                {originExitNumber ? ` · Exit ${originExitNumber}` : ''}
              </Text>
            </View>
          </View>

          <TextField
            label="Destination"
            value={destinationQuery}
            onChangeText={setDestinationQuery}
            placeholder="e.g. AREX Platform"
            returnKeyType="done"
            autoFocus
            onSubmitEditing={goNext}
          />

          <View style={styles.profileBlock}>
            <Text style={styles.profileLabel}>Traveling with luggage?</Text>
            <ProfileSwitcher value={profile} onChange={setProfile} />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton label="Find my way" disabled={!canContinue} onPress={goNext} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.xl,
  },
  header: {
    gap: 6,
  },
  mapLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  title: {
    fontSize: typography.screenTitle.fontSize,
    fontWeight: typography.screenTitle.fontWeight,
    lineHeight: typography.screenTitle.lineHeight,
    letterSpacing: -0.6,
    color: colors.labelStrong,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.fillAlternative,
  },
  dotFrom: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  summaryText: {
    flexShrink: 1,
    gap: 2,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.4,
    color: colors.labelAlternative,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.labelStrong,
  },
  profileBlock: {
    gap: spacing.sm,
  },
  profileLabel: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.4,
    color: colors.labelAlternative,
    textTransform: 'uppercase',
  },
  footer: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.md,
  },
});

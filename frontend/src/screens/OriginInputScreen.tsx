import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { PrimaryButton } from '../components/PrimaryButton';
import { TextField } from '../components/TextField';
import { colors, spacing, typography } from '../theme/tokens';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'OriginInput'>;

export function OriginInputScreen({ navigation }: Props) {
  const [originQuery, setOriginQuery] = useState('');
  const [originExitNumber, setOriginExitNumber] = useState('');

  const canContinue = originQuery.trim().length > 0;

  const goNext = () => {
    if (!canContinue) return;
    navigation.navigate('DestinationInput', {
      originQuery: originQuery.trim(),
      originExitNumber: originExitNumber.trim(),
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.mapLabel}>STEP 1 OF 2</Text>
            <Text style={styles.title}>Where are you{'\n'}starting from?</Text>
            <Text style={styles.subtitle}>
              Type a station or entrance name — you can paste it too.
            </Text>
          </View>

          <TextField
            label="Starting point"
            value={originQuery}
            onChangeText={setOriginQuery}
            placeholder="e.g. Seoul Station"
            returnKeyType="next"
          />

          <TextField
            label="Exit number (optional)"
            value={originExitNumber}
            onChangeText={setOriginExitNumber}
            placeholder="e.g. 1"
            keyboardType="number-pad"
            returnKeyType="done"
            onSubmitEditing={goNext}
          />
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton label="Continue" disabled={!canContinue} onPress={goNext} />
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
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.labelNeutral,
  },
  footer: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.md,
  },
});

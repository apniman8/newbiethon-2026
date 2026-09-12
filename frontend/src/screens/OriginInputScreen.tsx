import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { LuggageToggle } from '../components/LuggageToggle';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenTopBar } from '../components/ScreenTopBar';
import { TextField } from '../components/TextField';
import { DEFAULT_ORIGIN_EXIT, KNOWN_STATIONS, ORIGIN_EXITS } from '../data/constants';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing, typography } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'OriginInput'>;

// docs/ADR.md ADR-013: whatever the traveller enters here only ever feeds the
// display label — routing always starts from FIXED_START_PLACE_ID, so there
// is nothing to validate or match against a place list. This MVP's backend
// only has one map (Seoul Station), so the station field can't be checked
// against a real list either — it's free text for the same display-only reason.
export function OriginInputScreen({ navigation }: Props) {
  const [stationText, setStationText] = useState('');
  const [exit, setExit] = useState<(typeof ORIGIN_EXITS)[number]>(DEFAULT_ORIGIN_EXIT);
  const [hasLuggage, setHasLuggage] = useState(false);

  const matches = useMemo(() => {
    const query = stationText.trim().toLowerCase();
    if (!query) return [];
    const found = KNOWN_STATIONS.filter((name) => name.toLowerCase().includes(query));
    // Hide the list once the field already holds an exact pick.
    if (found.length === 1 && found[0].toLowerCase() === query) return [];
    return found.slice(0, 5);
  }, [stationText]);

  const goNext = () => {
    const station = stationText.trim();
    if (!station) return;
    navigation.navigate('DestinationInput', {
      originLabel: `${station} · Exit ${exit}`,
      profile: hasLuggage ? 'LUGGAGE' : 'STANDARD',
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenTopBar dots={{ total: 3, current: 1 }} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.eyebrow}>STEP 1 OF 2</Text>
            <Text style={styles.title}>Where are you starting from?</Text>
            <Text style={styles.subtitle}>
              This app currently only routes from Seoul Station — search for it below and pick your exit.
            </Text>
          </View>

          <View style={styles.fieldBlock}>
            <TextField
              value={stationText}
              onChangeText={setStationText}
              placeholder="Search for a station"
              autoFocus
              returnKeyType="next"
            />
            {matches.length > 0 && (
              <View style={styles.matchList}>
                {matches.map((name) => (
                  <Pressable
                    key={name}
                    accessibilityRole="button"
                    onPress={() => setStationText(name)}
                    style={({ pressed }) => [styles.matchRow, pressed && styles.matchRowPressed]}
                  >
                    <Text style={styles.matchText}>{name}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          <View style={styles.toggleBlock}>
            <Text style={styles.toggleLabel}>WHICH EXIT ARE YOU NEAREST TO?</Text>
            <View style={styles.toggleRow}>
              {ORIGIN_EXITS.map((option) => {
                const active = option === exit;
                return (
                  <Pressable
                    key={option}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    onPress={() => setExit(option)}
                    style={[styles.toggle, active && styles.toggleActive]}
                  >
                    <Text style={[styles.toggleText, active && styles.toggleTextActive]}>Exit {option}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <LuggageToggle value={hasLuggage} onChange={setHasLuggage} />
        <PrimaryButton label="Continue" disabled={!stationText.trim()} onPress={goNext} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xl,
    gap: spacing.xxl,
  },
  header: { gap: 10 },
  eyebrow: {
    fontSize: typography.eyebrow.fontSize,
    fontWeight: typography.eyebrow.fontWeight,
    letterSpacing: typography.eyebrow.letterSpacing,
    color: colors.primary,
  },
  title: {
    fontSize: typography.heroTitle.fontSize,
    fontWeight: typography.heroTitle.fontWeight,
    lineHeight: typography.heroTitle.lineHeight,
    letterSpacing: typography.heroTitle.letterSpacing,
    color: colors.labelStrong,
  },
  subtitle: { fontSize: 15, lineHeight: 21, color: colors.labelNeutral },
  fieldBlock: { gap: spacing.sm },
  matchList: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.lineNormalNormal,
    overflow: 'hidden',
  },
  matchRow: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.lineNormalNormal,
    backgroundColor: colors.background,
  },
  matchRowPressed: { backgroundColor: colors.fillAlternative },
  matchText: { fontSize: 15, fontWeight: '600', color: colors.labelStrong },
  toggleBlock: { gap: spacing.md },
  toggleLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.4,
    color: colors.labelAlternative,
  },
  toggleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  toggle: {
    minWidth: 78,
    height: 48,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.lineNormalNormal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleActive: {
    borderColor: colors.primary,
    backgroundColor: colors.calloutBackground,
  },
  toggleText: { fontSize: 15, fontWeight: '600', color: colors.labelNeutral },
  toggleTextActive: { color: colors.primaryStrong },
  footer: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.md,
    backgroundColor: colors.background,
    gap: spacing.md,
  },
});

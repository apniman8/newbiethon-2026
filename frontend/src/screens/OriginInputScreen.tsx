import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { LuggageToggle } from '../components/LuggageToggle';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenTopBar } from '../components/ScreenTopBar';
import { TextField } from '../components/TextField';
import { FIXED_START_PLACE_ID, MAP_ID } from '../data/constants';
import { usePlaces } from '../hooks/usePlaces';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing, typography } from '../theme/tokens';
import { matchPlace, matchPlaces } from '../utils/matchPlace';

type Props = NativeStackScreenProps<RootStackParamList, 'OriginInput'>;

// Searches the same live place list as the destination screen, filtered to
// selectableAsStart. The backend now accepts more than one start place, so
// picking a different real one here (e.g. "Line 4 Platform") must actually
// change what gets routed from — free text that doesn't match anything real
// still falls back to FIXED_START_PLACE_ID rather than failing outright.
export function OriginInputScreen({ navigation }: Props) {
  const [stationText, setStationText] = useState('');
  const [hasLuggage, setHasLuggage] = useState(false);
  const { places } = usePlaces(MAP_ID);

  const matches = useMemo(() => {
    const found = matchPlaces(places, stationText, 'start');
    // Hide the list once the field already holds an exact pick.
    if (found.length === 1 && found[0].displayName.toLowerCase() === stationText.trim().toLowerCase()) {
      return [];
    }
    return found;
  }, [places, stationText]);

  const goNext = () => {
    const text = stationText.trim();
    if (!text) return;
    const matched = matchPlace(places, text, 'start');
    navigation.navigate('DestinationInput', {
      originLabel: text,
      originPlaceId: matched?.id ?? FIXED_START_PLACE_ID,
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
              This app currently only covers Seoul Station — search for a starting point on its map below.
            </Text>
          </View>

          <View style={styles.fieldBlock}>
            <TextField
              value={stationText}
              onChangeText={setStationText}
              placeholder="Search for a starting point"
              autoFocus
              returnKeyType="next"
            />
            {matches.length > 0 && (
              <View style={styles.matchList}>
                {matches.map((place) => (
                  <Pressable
                    key={place.id}
                    accessibilityRole="button"
                    onPress={() => setStationText(place.displayName)}
                    style={({ pressed }) => [styles.matchRow, pressed && styles.matchRowPressed]}
                  >
                    <Text style={styles.matchName}>{place.displayName}</Text>
                    <Text style={styles.matchMeta}>{place.description}</Text>
                  </Pressable>
                ))}
              </View>
            )}
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
    gap: 2,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.lineNormalNormal,
    backgroundColor: colors.background,
  },
  matchRowPressed: { backgroundColor: colors.fillAlternative },
  matchName: { fontSize: 15, fontWeight: '700', color: colors.labelStrong },
  matchMeta: { fontSize: 13, fontWeight: '600', color: colors.labelAlternative },
  footer: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.md,
    backgroundColor: colors.background,
    gap: spacing.md,
  },
});

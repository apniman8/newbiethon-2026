import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenTopBar } from '../components/ScreenTopBar';
import { TextField } from '../components/TextField';
import { MAP_ID } from '../data/constants';
import { usePlaces } from '../hooks/usePlaces';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing, typography } from '../theme/tokens';
import { matchPlaces } from '../utils/matchPlace';

type Props = NativeStackScreenProps<RootStackParamList, 'DestinationInput'>;

// docs/ADR.md ADR-012: destination is free text — no picklist. The list
// shown here is a live preview only (same pattern as the origin screen's
// station search); the authoritative match (and the NOT_FOUND failure mode)
// happens in the Loading screen.
//
// profile (STANDARD/LUGGAGE) is picked on the origin screen — carried
// through untouched here.
export function DestinationInputScreen({ navigation, route }: Props) {
  const { originLabel, originPlaceId, profile } = route.params;
  const [destinationText, setDestinationText] = useState('');
  const { places } = usePlaces(MAP_ID);

  const matches = useMemo(() => {
    const found = matchPlaces(places, destinationText);
    // Hide the list once the field already holds an exact pick.
    if (found.length === 1 && found[0].displayName.toLowerCase() === destinationText.trim().toLowerCase()) {
      return [];
    }
    return found;
  }, [places, destinationText]);

  const goNext = () => {
    const text = destinationText.trim();
    if (!text) return;
    navigation.navigate('Loading', { originLabel, originPlaceId, destinationText: text, profile });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenTopBar onBack={() => navigation.goBack()} dots={{ total: 3, current: 2 }} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.eyebrow}>FROM {originLabel.toUpperCase()}</Text>
            <Text style={styles.title}>Where do you need to go?</Text>
          </View>

          <View style={styles.fieldBlock}>
            <TextField
              value={destinationText}
              onChangeText={setDestinationText}
              placeholder="Type a platform, exit, or facility"
              autoFocus
              returnKeyType="done"
              onSubmitEditing={goNext}
            />
            {matches.length > 0 && (
              <View style={styles.matchList}>
                {matches.map((place) => (
                  <Pressable
                    key={place.id}
                    accessibilityRole="button"
                    onPress={() => setDestinationText(place.displayName)}
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
        <PrimaryButton label="Find my way" disabled={!destinationText.trim()} onPress={goNext} />
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

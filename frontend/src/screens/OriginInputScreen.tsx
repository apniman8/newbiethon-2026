import React, { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { PlaceSelector } from '../components/PlaceSelector';
import { PrimaryButton } from '../components/PrimaryButton';
import { MAP_ID } from '../data/constants';
import { usePlaces } from '../hooks/usePlaces';
import type { RootStackParamList } from '../navigation/types';
import { colors, spacing, typography } from '../theme/tokens';
import type { Place } from '../types/contracts';

type Props = NativeStackScreenProps<RootStackParamList, 'OriginInput'>;

export function OriginInputScreen({ navigation }: Props) {
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const { places, loading, errorKind, retry } = usePlaces(MAP_ID);
  const startPlaces = useMemo(
    () => places.filter((place) => place.selectableAsStart),
    [places],
  );

  const goNext = () => {
    if (!selectedPlace) return;
    navigation.navigate('DestinationInput', {
      originPlaceId: selectedPlace.id,
      originDisplayName: selectedPlace.displayName,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.mapLabel}>STEP 1 OF 2</Text>
          <Text style={styles.title}>Where are you starting from?</Text>
          <Text style={styles.subtitle}>Choose one of the places available on this station map.</Text>
        </View>

        <PlaceSelector
          places={startPlaces}
          selectedPlaceId={selectedPlace?.id ?? null}
          loading={loading}
          errorKind={errorKind}
          onSelect={setSelectedPlace}
          onRetry={retry}
        />
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          label="Continue"
          disabled={!selectedPlace || loading || errorKind !== null}
          onPress={goNext}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.xl,
  },
  header: { gap: 6 },
  mapLabel: { fontSize: 13, fontWeight: '600', color: colors.primary },
  title: {
    fontSize: typography.screenTitle.fontSize,
    fontWeight: typography.screenTitle.fontWeight,
    lineHeight: typography.screenTitle.lineHeight,
    letterSpacing: -0.6,
    color: colors.labelStrong,
  },
  subtitle: { fontSize: 14, lineHeight: 20, color: colors.labelNeutral },
  footer: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.md,
    backgroundColor: colors.background,
  },
});

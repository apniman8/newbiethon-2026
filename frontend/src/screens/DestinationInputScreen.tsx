import React, { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { PlaceSelector } from '../components/PlaceSelector';
import { PrimaryButton } from '../components/PrimaryButton';
import { ProfileSwitcher } from '../components/ProfileSwitcher';
import { ScreenTopBar } from '../components/ScreenTopBar';
import { MAP_ID } from '../data/constants';
import { usePlaces } from '../hooks/usePlaces';
import type { RootStackParamList } from '../navigation/types';
import { colors, spacing, typography } from '../theme/tokens';
import type { Place, RoutingProfile } from '../types/contracts';

type Props = NativeStackScreenProps<RootStackParamList, 'DestinationInput'>;

export function DestinationInputScreen({ navigation, route }: Props) {
  const { originPlaceId, originDisplayName } = route.params;
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [profile, setProfile] = useState<RoutingProfile>('STANDARD');
  const { places, loading, errorKind, retry } = usePlaces(MAP_ID);
  const destinationPlaces = useMemo(
    () => places.filter((place) => place.selectableAsDestination && place.id !== originPlaceId),
    [originPlaceId, places],
  );

  const goNext = () => {
    if (!selectedPlace) return;
    navigation.navigate('Loading', {
      originPlaceId,
      originDisplayName,
      destinationPlaceId: selectedPlace.id,
      destinationDisplayName: selectedPlace.displayName,
      profile,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenTopBar title="Destination" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.mapLabel}>STEP 2 OF 2</Text>
          <Text style={styles.title}>Where are you heading?</Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.dotFrom} />
          <View style={styles.summaryText}>
            <Text style={styles.summaryLabel}>FROM</Text>
            <Text style={styles.summaryValue}>{originDisplayName}</Text>
          </View>
        </View>

        <PlaceSelector
          places={destinationPlaces}
          selectedPlaceId={selectedPlace?.id ?? null}
          loading={loading}
          errorKind={errorKind}
          onSelect={setSelectedPlace}
          onRetry={retry}
        />

        <View style={styles.profileBlock}>
          <Text style={styles.profileLabel}>Traveling with luggage?</Text>
          <ProfileSwitcher value={profile} onChange={setProfile} />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          label="Find my way"
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
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.fillAlternative,
  },
  dotFrom: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  summaryText: { flexShrink: 1, gap: 2 },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.4,
    color: colors.labelAlternative,
  },
  summaryValue: { fontSize: 15, fontWeight: '600', color: colors.labelStrong },
  profileBlock: { gap: spacing.sm },
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
    backgroundColor: colors.background,
  },
});

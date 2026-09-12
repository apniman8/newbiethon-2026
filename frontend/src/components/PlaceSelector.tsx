import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import type { RouteServiceErrorKind } from '../data/errors';
import { colors, radius, spacing } from '../theme/tokens';
import type { Place } from '../types/contracts';
import { SecondaryButton } from './SecondaryButton';

interface PlaceSelectorProps {
  places: Place[];
  selectedPlaceId: string | null;
  loading: boolean;
  errorKind: RouteServiceErrorKind | null;
  onSelect: (place: Place) => void;
  onRetry: () => void;
}

export function PlaceSelector({ places, selectedPlaceId, loading, errorKind, onSelect, onRetry }: PlaceSelectorProps) {
  if (loading) {
    return (
      <View style={styles.statusBox}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.statusText}>Loading available places…</Text>
      </View>
    );
  }

  if (errorKind) {
    return (
      <View style={styles.statusBox}>
        <Text style={styles.errorTitle}>Couldn&apos;t load places.</Text>
        <Text style={styles.statusText}>
          {errorKind === 'NETWORK'
            ? 'Check that the backend is running and the API address is correct.'
            : 'The server could not return the station places.'}
        </Text>
        <View style={styles.retryButton}>
          <SecondaryButton label="Retry" onPress={onRetry} />
        </View>
      </View>
    );
  }

  if (places.length === 0) {
    return (
      <View style={styles.statusBox}>
        <Text style={styles.errorTitle}>No places are available.</Text>
        <Text style={styles.statusText}>The current map has no selectable places.</Text>
      </View>
    );
  }

  return (
    <View accessibilityRole="radiogroup" style={styles.list}>
      {places.map((place) => {
        const selected = place.id === selectedPlaceId;
        return (
          <Pressable
            key={place.id}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            onPress={() => onSelect(place)}
            style={({ pressed }) => [styles.card, selected && styles.selectedCard, pressed && styles.pressedCard]}
          >
            <View style={[styles.radio, selected && styles.selectedRadio]}>
              {selected && <View style={styles.radioDot} />}
            </View>
            <View style={styles.placeText}>
              <Text style={[styles.placeName, selected && styles.selectedName]}>{place.displayName}</Text>
              <Text style={styles.description}>{place.description}</Text>
            </View>
            <Text style={styles.placeType}>{place.placeType}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.sm },
  card: {
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.lineNormalNormal,
    borderRadius: radius.xxl,
    backgroundColor: colors.background,
  },
  selectedCard: { borderColor: colors.primary, backgroundColor: colors.calloutBackground },
  pressedCard: { opacity: 0.8 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.lineNormalNormal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedRadio: { borderColor: colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  placeText: { flex: 1, gap: 3 },
  placeName: { fontSize: 15, fontWeight: '700', color: colors.labelStrong },
  selectedName: { color: colors.primaryStrong },
  description: { fontSize: 12, lineHeight: 17, color: colors.labelNeutral },
  placeType: { fontSize: 10, fontWeight: '700', color: colors.labelAlternative },
  statusBox: {
    minHeight: 140,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.xxl,
    backgroundColor: colors.fillAlternative,
  },
  errorTitle: { fontSize: 15, fontWeight: '700', color: colors.labelStrong },
  statusText: { fontSize: 13, lineHeight: 18, textAlign: 'center', color: colors.labelNeutral },
  retryButton: { width: 160, marginTop: spacing.sm },
});

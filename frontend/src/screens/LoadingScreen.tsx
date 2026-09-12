import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ErrorState } from '../components/ErrorState';
import { MAP_ID } from '../data/constants';
import { RouteServiceError, type RouteServiceErrorKind } from '../data/errors';
import { getRoute } from '../data/routeService';
import { useSlowLoadHint } from '../hooks/useSlowLoadHint';
import type { RootStackParamList } from '../navigation/types';
import { colors, spacing } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'Loading'>;

export function LoadingScreen({ route: navRoute, navigation }: Props) {
  const { originPlaceId, originDisplayName, destinationPlaceId, destinationDisplayName, profile } = navRoute.params;
  const [errorKind, setErrorKind] = useState<RouteServiceErrorKind | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const loading = errorKind === null;
  const slowLoad = useSlowLoadHint(loading);

  useEffect(() => {
    let cancelled = false;
    setErrorKind(null);

    getRoute({ mapId: MAP_ID, startPlaceId: originPlaceId, destinationPlaceId, profile })
      .then((routeResponse) => {
        if (!cancelled) {
          navigation.replace('Guide', { route: routeResponse, originLabel: originDisplayName });
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setErrorKind(error instanceof RouteServiceError ? error.kind : 'SERVER_ERROR');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [originPlaceId, originDisplayName, destinationPlaceId, profile, navigation, reloadToken]);

  return (
    <SafeAreaView style={styles.safeArea}>
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.title}>Finding your way</Text>
          <Text style={styles.subtitle}>{originDisplayName} → {destinationDisplayName}</Text>
          {slowLoad && <Text style={styles.slowHint}>Still looking for a route…</Text>}
        </View>
      ) : (
        <ErrorState
          kind={errorKind}
          destination={destinationDisplayName}
          onRetry={
            errorKind === 'NETWORK' || errorKind === 'SERVER_ERROR'
              ? () => setReloadToken((token) => token + 1)
              : undefined
          }
          onChooseDifferent={
            errorKind === 'NOT_FOUND' || errorKind === 'INVALID_REQUEST'
              ? () => navigation.goBack()
              : undefined
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xxxl,
  },
  title: { fontSize: 18, fontWeight: '700', color: colors.labelStrong, marginTop: spacing.sm },
  subtitle: { fontSize: 14, fontWeight: '500', color: colors.labelNeutral, textAlign: 'center' },
  slowHint: { fontSize: 13, color: colors.labelAlternative, marginTop: spacing.sm },
});

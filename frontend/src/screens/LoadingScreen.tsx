import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ErrorState } from '../components/ErrorState';
import { FIXED_START_PLACE_ID, MAP_ID } from '../data/constants';
import { RouteServiceError, type RouteServiceErrorKind } from '../data/errors';
import { getPlaces, getRoute } from '../data/routeService';
import { useSlowLoadHint } from '../hooks/useSlowLoadHint';
import { colors, spacing } from '../theme/tokens';
import { resolveDestination } from '../utils/matchPlace';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Loading'>;

// Connects the freely-typed origin/destination to an actual route
// (docs/PRD.md "출발지·도착지 자유 입력"). A destination that doesn't match
// any known place is a NOT_FOUND, handled with the same ErrorState as any
// other route lookup failure (docs/ADR.md ADR-007).
export function LoadingScreen({ route: navRoute, navigation }: Props) {
  const { originQuery, originExitNumber, destinationQuery, profile } = navRoute.params;
  const [errorKind, setErrorKind] = useState<RouteServiceErrorKind | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const loading = errorKind === null;
  const slowLoad = useSlowLoadHint(loading);

  useEffect(() => {
    let cancelled = false;
    setErrorKind(null);

    (async () => {
      try {
        const places = await getPlaces(MAP_ID);
        const destination = resolveDestination(places.places, destinationQuery);
        if (!destination) {
          throw new RouteServiceError('NOT_FOUND', `No place matches "${destinationQuery}"`);
        }

        const routeResponse = await getRoute({
          mapId: MAP_ID,
          startPlaceId: FIXED_START_PLACE_ID,
          destinationPlaceId: destination.id,
          profile,
        });

        if (cancelled) return;

        const originLabel = originExitNumber
          ? `${originQuery} · Exit ${originExitNumber}`
          : originQuery;

        navigation.replace('TurnByTurn', { route: routeResponse, originLabel });
      } catch (e) {
        if (cancelled) return;
        setErrorKind(e instanceof RouteServiceError ? e.kind : 'SERVER_ERROR');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [originQuery, originExitNumber, destinationQuery, profile, navigation, reloadToken]);

  return (
    <SafeAreaView style={styles.safeArea}>
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.title}>Finding your way</Text>
          <Text style={styles.subtitle}>
            {originQuery} → {destinationQuery}
          </Text>
          {slowLoad && <Text style={styles.slowHint}>Still looking for a route…</Text>}
        </View>
      ) : (
        <ErrorState
          kind={errorKind}
          destination={destinationQuery}
          onRetry={
            errorKind === 'NETWORK' || errorKind === 'SERVER_ERROR'
              ? () => setReloadToken((t) => t + 1)
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
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xxxl,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.labelStrong,
    marginTop: spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.labelNeutral,
    textAlign: 'center',
  },
  slowHint: {
    fontSize: 13,
    color: colors.labelAlternative,
    marginTop: spacing.sm,
  },
});

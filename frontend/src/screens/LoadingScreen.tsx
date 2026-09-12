import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ErrorState } from '../components/ErrorState';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';
import { MAP_ID } from '../data/constants';
import { RouteServiceError, type RouteServiceErrorKind } from '../data/errors';
import { getPlaces, getRoute } from '../data/routeService';
import { useSlowLoadHint } from '../hooks/useSlowLoadHint';
import type { RootStackParamList } from '../navigation/types';
import { colors, spacing, typography } from '../theme/tokens';
import type { RouteResponse } from '../types/contracts';
import { baseDisplayName, capitalize, spellNumber } from '../utils/format';
import { matchPlace } from '../utils/matchPlace';
import { floorStops, toGuideSteps } from '../utils/routeSteps';

type Props = NativeStackScreenProps<RootStackParamList, 'Loading'>;

type Status = 'loading' | 'ready' | 'error';

// docs/ADR.md ADR-012: the free-text destination is matched against known
// places here, not in DestinationInput. A miss becomes RouteServiceError
// ('NOT_FOUND'), same as any other routing failure.
//
// The "ready" state also folds in the route-preview the confirmed design
// combines with this screen (Guide Screen UX Review.dc.html, id="3": 2e's
// text-first tone + 2b's floor progress). It waits for the traveller to
// confirm with "Start" rather than auto-advancing — they should get a look
// at the route before the checklist begins.
export function LoadingScreen({ route: navRoute, navigation }: Props) {
  const { originLabel, originPlaceId, destinationText, profile } = navRoute.params;
  const [status, setStatus] = useState<Status>('loading');
  const [errorKind, setErrorKind] = useState<RouteServiceErrorKind | null>(null);
  const [routeResponse, setRouteResponse] = useState<RouteResponse | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const slowLoad = useSlowLoadHint(status === 'loading');

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setErrorKind(null);
    setRouteResponse(null);

    (async () => {
      try {
        const places = await getPlaces(MAP_ID);
        const match = matchPlace(places.places, destinationText);
        if (!match) {
          throw new RouteServiceError('NOT_FOUND', `No known place matches "${destinationText}"`);
        }
        const response = await getRoute({
          mapId: MAP_ID,
          startPlaceId: originPlaceId,
          destinationPlaceId: match.id,
          profile,
        });
        if (cancelled) return;
        setRouteResponse(response);
        setStatus('ready');
      } catch (error) {
        if (cancelled) return;
        setErrorKind(error instanceof RouteServiceError ? error.kind : 'SERVER_ERROR');
        setStatus('error');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [originPlaceId, destinationText, profile, reloadToken]);

  const startGuide = () => {
    if (routeResponse) navigation.replace('Guide', { route: routeResponse, originLabel });
  };

  const steps = useMemo(() => (routeResponse ? toGuideSteps(routeResponse) : []), [routeResponse]);
  const stops = useMemo(() => (routeResponse ? floorStops(routeResponse, steps) : []), [routeResponse, steps]);

  if (status === 'error' && errorKind) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ErrorState
          kind={errorKind}
          destination={destinationText}
          onRetry={
            errorKind === 'NETWORK' || errorKind === 'SERVER_ERROR'
              ? () => setReloadToken((t) => t + 1)
              : undefined
          }
          onChooseDifferent={
            errorKind === 'NOT_FOUND' || errorKind === 'INVALID_REQUEST' ? () => navigation.goBack() : undefined
          }
        />
      </SafeAreaView>
    );
  }

  const minutes = routeResponse ? Math.max(1, Math.round(routeResponse.summary.estimatedDurationSeconds / 60)) : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        {status === 'loading' || !routeResponse ? (
          <>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.eyebrow}>FINDING YOUR WAY</Text>
            <Text style={styles.title}>{destinationText}</Text>
            <Text style={styles.subtitle}>From {originLabel}.</Text>
            {slowLoad && <Text style={styles.slowHint}>Still looking for a route…</Text>}
          </>
        ) : (
          <>
            <Text style={styles.eyebrow}>FINDING YOUR WAY</Text>
            <Text style={styles.title}>
              {baseDisplayName(routeResponse.destination.displayName, routeResponse.destination.floor)},{' '}
              {routeResponse.destination.floor}.
            </Text>
            <Text style={styles.subtitle}>
              {capitalize(spellNumber(steps.length))} step{steps.length === 1 ? '' : 's'}, about{' '}
              {spellNumber(minutes)} minute{minutes === 1 ? '' : 's'} on foot
              {routeResponse.summary.elevatorCount > 0
                ? `, ${spellNumber(routeResponse.summary.elevatorCount)} elevator${
                    routeResponse.summary.elevatorCount > 1 ? 's' : ''
                  }`
                : ''}
              .
            </Text>

            <View style={styles.floorList}>
              {stops.map((stop, i) => {
                const isFirst = i === 0;
                const isLast = i === stops.length - 1;
                return (
                  <View key={`${stop.floor}-${i}`}>
                    {i > 0 && <View style={styles.floorConnector} />}
                    <View style={styles.floorRow}>
                      <View
                        style={[
                          styles.floorBadge,
                          isFirst && styles.floorBadgeStart,
                          !isFirst && !isLast && styles.floorBadgeMid,
                        ]}
                      >
                        <Text
                          style={[
                            styles.floorBadgeText,
                            isFirst && styles.floorBadgeTextStart,
                            !isFirst && !isLast && styles.floorBadgeTextMid,
                          ]}
                        >
                          {stop.floor}
                        </Text>
                      </View>
                      <Text style={[styles.floorLabel, isFirst && styles.floorLabelStrong]} numberOfLines={1}>
                        {stop.label}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}
      </View>

      <View style={styles.footer}>
        {status === 'ready' && routeResponse && <PrimaryButton label="Start" onPress={startGuide} />}
        <SecondaryButton label="Cancel" onPress={() => navigation.goBack()} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xxxl,
  },
  eyebrow: {
    fontSize: typography.eyebrow.fontSize,
    fontWeight: typography.eyebrow.fontWeight,
    letterSpacing: typography.eyebrow.letterSpacing,
    color: colors.primary,
    marginTop: spacing.sm,
  },
  title: {
    fontSize: typography.heroTitle.fontSize,
    fontWeight: typography.heroTitle.fontWeight,
    lineHeight: typography.heroTitle.lineHeight,
    letterSpacing: typography.heroTitle.letterSpacing,
    color: colors.labelStrong,
  },
  subtitle: { fontSize: 15, lineHeight: 21, color: colors.labelNeutral },
  slowHint: { fontSize: 13, color: colors.labelAlternative, marginTop: spacing.sm },
  floorList: { marginTop: spacing.sm },
  floorConnector: {
    width: 2,
    height: 14,
    marginLeft: 11,
    backgroundColor: colors.lineNormalNormal,
  },
  floorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  floorBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.fillAlternative,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floorBadgeStart: { backgroundColor: colors.primary },
  floorBadgeMid: { backgroundColor: colors.calloutBackground },
  floorBadgeText: { fontSize: 10, fontWeight: '700', color: colors.labelAlternative },
  floorBadgeTextStart: { color: colors.white },
  floorBadgeTextMid: { color: colors.primary },
  floorLabel: { flexShrink: 1, fontSize: 13, fontWeight: '600', color: colors.labelAlternative },
  floorLabelStrong: { color: colors.labelStrong },
  footer: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
});

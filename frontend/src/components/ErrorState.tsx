import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '../theme/tokens';
import type { RouteServiceErrorKind } from '../data/errors';
import { PrimaryButton } from './PrimaryButton';
import { SecondaryButton } from './SecondaryButton';

// docs/UI_GUIDE.md "에러·엣지 상태" > ErrorState. One copy/action table so no
// screen invents its own wording per RouteServiceErrorKind (docs/ADR.md ADR-007).
const COPY: Record<RouteServiceErrorKind, { icon: string; title: (destination?: string) => string; action: 'retry' | 'chooseDifferent' }> = {
  NETWORK: {
    icon: '📶',
    title: () => 'You appear to be offline.',
    action: 'retry',
  },
  NOT_FOUND: {
    icon: '📍',
    title: (destination) =>
      destination ? `We couldn't find a route to ${destination}.` : "We couldn't find that route.",
    action: 'chooseDifferent',
  },
  INVALID_REQUEST: {
    icon: '!',
    title: () => "Something's off with this request.",
    action: 'chooseDifferent',
  },
  SERVER_ERROR: {
    icon: '!',
    title: () => 'Something went wrong on our end.',
    action: 'retry',
  },
};

export interface ErrorStateProps {
  kind: RouteServiceErrorKind;
  destination?: string;
  onRetry?: () => void;
  onChooseDifferent?: () => void;
}

export function ErrorState({ kind, destination, onRetry, onChooseDifferent }: ErrorStateProps) {
  const copy = COPY[kind];

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Text style={styles.iconGlyph}>{copy.icon}</Text>
      </View>
      <Text style={styles.title}>{copy.title(destination)}</Text>
      {copy.action === 'retry' && onRetry && (
        <View style={styles.actionWrap}>
          <PrimaryButton label="Retry" onPress={onRetry} />
        </View>
      )}
      {copy.action === 'chooseDifferent' && onChooseDifferent && (
        <View style={styles.actionWrap}>
          <SecondaryButton label="Choose a different destination" onPress={onChooseDifferent} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xxxl,
    paddingTop: spacing.xxxl,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.fillAlternative,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGlyph: {
    fontSize: 24,
    color: colors.labelAlternative,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.labelStrong,
    textAlign: 'center',
  },
  actionWrap: {
    alignSelf: 'stretch',
    maxWidth: 280,
  },
});

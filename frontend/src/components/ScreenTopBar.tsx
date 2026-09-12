import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StepDots } from './StepDots';
import { colors, spacing } from '../theme/tokens';

export interface ScreenTopBarProps {
  title?: string;
  onBack?: () => void;
  /** Small progress dots, centered — the input-flow header pattern from the
   * confirmed design (Guide Screen UX Review.dc.html, id="3"). */
  dots?: { total: number; current: number };
}

export function ScreenTopBar({ title, onBack, dots }: ScreenTopBarProps) {
  return (
    <View style={styles.topBar}>
      {onBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={onBack}
          style={styles.backButton}
        >
          <Text style={styles.backGlyph}>‹</Text>
        </Pressable>
      ) : (
        dots && <View style={styles.backButton} />
      )}
      {dots && (
        <View style={styles.center}>
          <StepDots total={dots.total} current={dots.current} />
        </View>
      )}
      {title && <Text style={styles.title}>{title}</Text>}
      {dots && <View style={styles.backButton} />}
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.fillAlternative,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backGlyph: {
    fontSize: 18,
    color: colors.labelNeutral,
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.labelStrong,
  },
});

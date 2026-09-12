import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '../theme/tokens';

export interface ScreenTopBarProps {
  title: string;
  onBack?: () => void;
}

export function ScreenTopBar({ title, onBack }: ScreenTopBarProps) {
  return (
    <View style={styles.topBar}>
      {onBack && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={onBack}
          style={styles.backButton}
        >
          <Text style={styles.backGlyph}>‹</Text>
        </Pressable>
      )}
      <Text style={styles.title}>{title}</Text>
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
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.labelStrong,
  },
});

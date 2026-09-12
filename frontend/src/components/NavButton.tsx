import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius } from '../theme/tokens';

export interface NavButtonProps {
  variant: 'prev' | 'next' | 'finish';
  label?: string;
  disabled?: boolean;
  onPress: () => void;
}

export function NavButton({ variant, label, disabled, onPress }: NavButtonProps) {
  if (variant === 'prev') {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Previous step"
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.prevButton,
          disabled && styles.disabled,
          pressed && !disabled && styles.prevPressed,
        ]}
      >
        <Text style={styles.prevGlyph}>‹</Text>
      </Pressable>
    );
  }

  const isFinish = variant === 'finish';
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.nextButton,
        isFinish && styles.finishButton,
        disabled && styles.disabled,
        pressed && !disabled && styles.nextPressed,
      ]}
    >
      <Text style={styles.nextLabel}>{label ?? (isFinish ? "I'm here" : 'Next step')}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  prevButton: {
    width: 56,
    height: 56,
    borderRadius: radius.xl,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  prevPressed: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  prevGlyph: {
    fontSize: 20,
    color: colors.white,
  },
  nextButton: {
    flex: 1,
    height: 56,
    borderRadius: radius.xl,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextPressed: {
    backgroundColor: colors.primaryStrong,
  },
  finishButton: {
    backgroundColor: 'rgba(51,102,255,0.4)',
  },
  disabled: {
    opacity: 0.45,
  },
  nextLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.white,
  },
});

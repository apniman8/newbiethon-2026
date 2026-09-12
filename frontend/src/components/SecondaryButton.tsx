import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius } from '../theme/tokens';

export interface SecondaryButtonProps {
  label: string;
  onPress: () => void;
}

export function SecondaryButton({ label, onPress }: SecondaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.lineNormalNormal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    backgroundColor: colors.fillNormal,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.labelNeutral,
  },
});

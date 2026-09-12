import React, { useState } from 'react';
import type { KeyboardTypeOptions, ReturnKeyTypeOptions } from 'react-native';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, radius, spacing } from '../theme/tokens';

export interface TextFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  returnKeyType?: ReturnKeyTypeOptions;
  autoFocus?: boolean;
  onSubmitEditing?: () => void;
}

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  returnKeyType,
  autoFocus,
  onSubmitEditing,
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.labelAlternative}
        keyboardType={keyboardType}
        returnKeyType={returnKeyType}
        autoFocus={autoFocus}
        onSubmitEditing={onSubmitEditing}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[styles.input, focused && styles.inputFocused]}
        // Free typing and pasting both land here — TextInput supports paste
        // out of the box, no extra wiring needed.
        autoCorrect={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.4,
    color: colors.labelAlternative,
    textTransform: 'uppercase',
  },
  input: {
    height: 52,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.lineNormalNormal,
    paddingHorizontal: spacing.lg,
    fontSize: 16,
    fontWeight: '500',
    color: colors.labelStrong,
    backgroundColor: colors.background,
  },
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
});

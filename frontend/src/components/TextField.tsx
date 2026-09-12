import React, { useState } from 'react';
import type { KeyboardTypeOptions, ReturnKeyTypeOptions } from 'react-native';
import { StyleSheet, TextInput } from 'react-native';

import { colors } from '../theme/tokens';

export interface TextFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  returnKeyType?: ReturnKeyTypeOptions;
  autoFocus?: boolean;
  onSubmitEditing?: () => void;
}

// docs/ADR.md ADR-012: origin and destination are free text, styled as the
// single underlined line the confirmed design uses instead of a boxed field
// (Guide Screen UX Review.dc.html, id="3").
export function TextField({
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
      style={[styles.input, (focused || value.length > 0) && styles.inputActive]}
      // Free typing and pasting both land here — TextInput supports paste
      // out of the box, no extra wiring needed.
      autoCorrect={false}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    height: 56,
    borderBottomWidth: 2,
    borderBottomColor: colors.lineNormalNormal,
    fontSize: 20,
    fontWeight: '500',
    color: colors.labelStrong,
  },
  inputActive: {
    borderBottomColor: colors.primary,
  },
});

import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors } from '../theme/tokens';

export interface StepDotsProps {
  total: number;
  current: number;
}

// The small progress dots the confirmed design shows in the input-flow
// header (Guide Screen UX Review.dc.html, id="3").
export function StepDots({ total, current }: StepDotsProps) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={[styles.dot, i < current && styles.dotFilled]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.lineNormalNormal,
  },
  dotFilled: {
    backgroundColor: colors.primary,
  },
});

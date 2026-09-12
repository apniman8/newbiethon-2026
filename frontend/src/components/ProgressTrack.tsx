import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radius } from '../theme/tokens';

export interface ProgressTrackProps {
  current: number; // 0-indexed
  total: number;
}

export function ProgressTrack({ current, total }: ProgressTrackProps) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[styles.bar, i <= current ? styles.barActive : styles.barInactive]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  bar: {
    flex: 1,
    height: 4,
    borderRadius: radius.sm / 4,
  },
  barActive: {
    backgroundColor: colors.primary,
  },
  barInactive: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
});

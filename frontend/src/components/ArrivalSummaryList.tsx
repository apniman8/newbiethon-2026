import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius } from '../theme/tokens';
import { formatDuration } from '../utils/format';

export interface ArrivalSummaryListProps {
  walkedMeters: number;
  durationSeconds: number;
  nextTrainMinutes?: number;
}

export function ArrivalSummaryList({
  walkedMeters,
  durationSeconds,
  nextTrainMinutes,
}: ArrivalSummaryListProps) {
  const { minutes, seconds } = formatDuration(durationSeconds);
  const rows = [
    { label: 'Walked', value: `${walkedMeters} m` },
    { label: 'Took', value: `${minutes} min ${seconds} s` },
    ...(nextTrainMinutes != null
      ? [{ label: 'Next train', value: `${nextTrainMinutes} min` }]
      : []),
  ];

  return (
    <View style={styles.group}>
      {rows.map((row, i) => (
        <View key={row.label} style={[styles.row, i > 0 && styles.divider]}>
          <Text style={styles.label}>{row.label}</Text>
          <Text style={styles.value}>{row.value}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    borderRadius: radius.xxl,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.fillAlternative,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: colors.lineNormalNormal,
  },
  label: {
    fontSize: 14,
    color: colors.labelAlternative,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.labelStrong,
  },
});

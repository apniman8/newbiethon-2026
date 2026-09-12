import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius } from '../theme/tokens';
import type { Landmark } from '../types/contracts';

export interface LandmarkCalloutProps {
  landmark: Landmark;
}

export function LandmarkCallout({ landmark }: LandmarkCalloutProps) {
  return (
    <View style={styles.container}>
      <View style={styles.typeBadge}>
        <Text style={styles.typeBadgeText}>{landmark.type}</Text>
      </View>
      <View style={styles.textCol}>
        <Text style={styles.name}>{landmark.name}</Text>
        <Text style={styles.description}>{landmark.description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: radius.xl,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: 'rgba(51,102,255,0.26)',
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    color: '#9CC0FF',
  },
  textCol: {
    flexShrink: 1,
    gap: 3,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  description: {
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(255,255,255,0.62)',
  },
});

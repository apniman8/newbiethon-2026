import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius } from '../theme/tokens';
import type { RoutingProfile } from '../types/contracts';

// WHEELCHAIR must never appear here (docs/ADR.md ADR-005 / route-enums-v1.1.md).
const PROFILES: { id: RoutingProfile; label: string }[] = [
  { id: 'STANDARD', label: 'Standard' },
  { id: 'LUGGAGE', label: 'With luggage' },
];

export interface ProfileSwitcherProps {
  value: RoutingProfile;
  onChange: (profile: RoutingProfile) => void;
}

export function ProfileSwitcher({ value, onChange }: ProfileSwitcherProps) {
  return (
    <View style={styles.row}>
      {PROFILES.map((p) => {
        const active = p.id === value;
        return (
          <Pressable
            key={p.id}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(p.id)}
            style={[styles.pill, active ? styles.pillActive : styles.pillDefault]}
          >
            <Text style={[styles.label, active ? styles.labelActive : styles.labelDefault]}>
              {p.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    flex: 1,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillDefault: {
    borderWidth: 1,
    borderColor: colors.lineNormalNormal,
    backgroundColor: 'transparent',
  },
  pillActive: {
    backgroundColor: colors.labelStrong,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
  labelDefault: {
    color: colors.labelNeutral,
  },
  labelActive: {
    color: colors.white,
  },
});

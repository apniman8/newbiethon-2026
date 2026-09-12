import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

import { colors } from '../theme/tokens';

export interface LuggageToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

function SuitcaseIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path
        d="M9.5 8 L9.5 5.5 Q9.5 4 11 4 L13 4 Q14.5 4 14.5 5.5 L14.5 8"
        stroke={color}
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Rect x={4.5} y={8} width={15} height={11.5} rx={2} stroke={color} strokeWidth={1.9} fill="none" />
    </Svg>
  );
}

// One optional toggle, not two buttons — leaving it off is a valid choice
// (routes STANDARD), so nothing here blocks moving on.
//
// Copy says "avoid stairs" rather than "with luggage": that's the actual
// effect of the LUGGAGE profile (prefers elevators/escalators over stairs),
// and it reads honestly for anyone with a mobility reason too — without
// implying a verified accessibility guarantee the route data doesn't back
// (docs/ADR.md ADR-016 / route-enums-v1.2.md: WHEELCHAIR stays unexposed).
export function LuggageToggle({ value, onChange }: LuggageToggleProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Avoid stairs where possible"
      accessibilityState={{ selected: value }}
      onPress={() => onChange(!value)}
      style={styles.row}
    >
      <View style={[styles.circle, value && styles.circleActive]}>
        <SuitcaseIcon color={value ? colors.white : colors.labelNeutral} />
      </View>
      <Text style={styles.label}>{value ? 'With luggage / Avoid stairs' : 'No luggage / Stairs OK'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    alignSelf: 'flex-start',
  },
  circle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: colors.lineNormalNormal,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleActive: {
    borderColor: colors.labelStrong,
    backgroundColor: colors.labelStrong,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.labelStrong,
  },
});

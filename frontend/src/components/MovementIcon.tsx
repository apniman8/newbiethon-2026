import React from 'react';
import Svg, { Circle, Path, Polyline, Rect } from 'react-native-svg';

import type { MovementType } from '../types/contracts';

// v1.2 dropped the turn-direction field, so the movement type is what the step
// icon shows. Stroke icons on a 24px grid, one consistent weight.
export interface MovementIconProps {
  movementType: MovementType;
  size?: number;
  color?: string;
}

export function MovementIcon({ movementType, size = 24, color = '#FFFFFF' }: MovementIconProps) {
  const stroke = {
    stroke: color,
    strokeWidth: 1.9,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {movementType === 'WALK' && (
        <>
          <Circle cx={12.5} cy={4.5} r={2} {...stroke} />
          <Path d="M 12.5 8 L 12.5 14 L 9.5 20.5" {...stroke} />
          <Path d="M 12.5 14 L 15.5 19.5" {...stroke} />
          <Path d="M 12.5 10 L 9 12" {...stroke} />
          <Path d="M 12.5 10 L 16 11.5" {...stroke} />
        </>
      )}

      {movementType === 'STAIR' && (
        <Path d="M 3 20 L 8 20 L 8 15.5 L 13 15.5 L 13 11 L 18 11 L 18 6.5 L 21.5 6.5" {...stroke} />
      )}

      {movementType === 'ESCALATOR' && (
        <>
          <Path d="M 3.5 20 L 20 6.5" {...stroke} />
          <Polyline points="14 6.5 20.5 6.5 20.5 13" {...stroke} />
          <Path d="M 7.5 16.5 L 10.5 16.5" {...stroke} />
          <Path d="M 12.5 11.5 L 15.5 11.5" {...stroke} />
        </>
      )}

      {movementType === 'ELEVATOR' && (
        <>
          <Rect x={5} y={3} width={14} height={18} rx={2.5} {...stroke} />
          <Polyline points="9.5 11 12 8.5 14.5 11" {...stroke} />
          <Polyline points="9.5 14.5 12 17 14.5 14.5" {...stroke} />
        </>
      )}

      {movementType === 'RAMP' && (
        <>
          <Path d="M 3 19 L 21 19" {...stroke} />
          <Path d="M 3.5 19 L 20 8.5" {...stroke} />
          <Path d="M 20 8.5 L 20 19" {...stroke} />
        </>
      )}

      {movementType === 'MOVING_WALKWAY' && (
        <>
          <Path d="M 3 16 L 19 16" {...stroke} />
          <Polyline points="15 11.5 20.5 16 15 20.5" {...stroke} />
          <Path d="M 6 12.5 L 6 19.5" {...stroke} />
          <Path d="M 10 12.5 L 10 19.5" {...stroke} />
        </>
      )}
    </Svg>
  );
}

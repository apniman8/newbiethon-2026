import type { MovementType } from '../types/contracts';

// v1.2 edges carry no turn direction, so the movement type is what labels a
// step (route-enums-v1.2.md).
export const MOVEMENT_LABELS: Record<MovementType, string> = {
  WALK: 'Walk',
  STAIR: 'Stairs',
  ESCALATOR: 'Escalator',
  ELEVATOR: 'Elevator',
  RAMP: 'Ramp',
  MOVING_WALKWAY: 'Moving walkway',
};

export function formatDistance(meters: number): string {
  return meters > 0 ? `${meters} m` : 'No walking';
}

export function formatDuration(totalSeconds: number): { minutes: number; seconds: number } {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return { minutes, seconds };
}

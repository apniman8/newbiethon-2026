import type { Direction } from '../types/contracts';

export const ARROW_GLYPHS: Record<Direction, string> = {
  START: '◉', // ◉
  STRAIGHT: '↑', // ↑
  LEFT: '↰', // ↰
  RIGHT: '↱', // ↱
  SLIGHT_LEFT: '↖', // ↖
  SLIGHT_RIGHT: '↗', // ↗
  U_TURN: '↺', // ↺
  UP: '↥', // ↥
  DOWN: '↧', // ↧
  ARRIVE: '◎', // ◎
};

export function formatDistance(meters: number): string {
  return meters > 0 ? `${meters} m` : 'One level down';
}

export function formatDuration(totalSeconds: number): { minutes: number; seconds: number } {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return { minutes, seconds };
}

export function formatFloorLabel(fromFloor: string, toFloor: string): string {
  return fromFloor === toFloor ? fromFloor : `${fromFloor} → ${toFloor}`;
}

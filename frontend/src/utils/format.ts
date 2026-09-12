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

const NUMBER_WORDS = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen',
  'nineteen', 'twenty',
];

// The confirmed design spells small counts out ("Seven steps, about three
// minutes…"). Falls back to the numeral outside the spelled range.
export function spellNumber(n: number): string {
  return n >= 0 && n < NUMBER_WORDS.length ? NUMBER_WORDS[n] : String(n);
}

export function capitalize(word: string): string {
  return word.length > 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word;
}

// "AREX Platform (B7)" + floor "B7" -> "AREX Platform" — lets the Loading
// screen compose "AREX Platform, B7." without repeating the floor twice.
export function baseDisplayName(displayName: string, floor: string): string {
  const suffix = ` (${floor})`;
  return displayName.endsWith(suffix) ? displayName.slice(0, -suffix.length) : displayName;
}

// API descriptions are full sentences ("Take the elevator toward the...
// platform level."); the floor-progress list wants a scannable label, not a
// sentence, so this keeps the first clause and caps its length.
export function shortenLabel(text: string, maxLen = 28): string {
  const firstClause = text.split(/[.!?]/)[0].trim();
  if (firstClause.length <= maxLen) return firstClause;
  const truncated = firstClause.slice(0, maxLen);
  const lastSpace = truncated.lastIndexOf(' ');
  return `${truncated.slice(0, lastSpace > 8 ? lastSpace : maxLen)}…`;
}

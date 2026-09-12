// Phase 0 MVP is scoped to a single station map.

export const MAP_ID = 'SEOUL_STATION_KTX_TO_AREX';

// docs/ADR.md ADR-013: the origin screen's exit toggle only ever feeds the
// display label. Every routing request starts here, regardless of what the
// traveller picked.
export const FIXED_START_PLACE_ID = 'SEOUL_KTX_ARRIVAL';

export const ORIGIN_EXITS = ['1', '2', '3', '4'] as const;
export const DEFAULT_ORIGIN_EXIT: (typeof ORIGIN_EXITS)[number] = '1';

// The backend only has one map (Seoul Station) — there is no station-search
// API to back a real autocomplete. This local list only drives the origin
// screen's search suggestions; whatever the traveller picks is still purely
// the display-only originLabel (docs/ADR.md ADR-013), so listing other
// stations here doesn't imply the app can actually route from them.
export const KNOWN_STATIONS = [
  'Seoul Station',
  'Yongsan Station',
  'Gangnam Station',
  'Hongik Univ. Station',
  'Sadang Station',
  'Express Bus Terminal Station',
  'Jamsil Station',
  'Konkuk Univ. Station',
] as const;

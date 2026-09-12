// Phase 0 MVP is scoped to a single station map.

export const MAP_ID = 'SEOUL_STATION_KTX_TO_AREX';

// Fallback only — used when the origin screen's free text doesn't match any
// real selectableAsStart place. The backend actually accepts several start
// places now (KTX arrival concourse, Line 1/4 platforms, Exit 15, AREX
// platform), so a real match always wins over this default.
export const FIXED_START_PLACE_ID = 'SEOUL_KTX_ARRIVAL';

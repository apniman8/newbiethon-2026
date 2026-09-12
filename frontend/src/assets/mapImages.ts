// Bundled station map images, keyed by the contract's `mapImages[].assetKey`.
// A key with no entry here renders without a background — the route geometry
// still draws, it just has nothing behind it (docs/ADR.md ADR-014).
//
// The sizes below are the real pixel dimensions of the files in this folder,
// which are NOT always what the contract declares in intrinsicWidth/Height —
// see the note in docs/ADR.md ADR-016. Drawing uses these, because a wrong
// aspect ratio visibly distorts the artwork.

export interface MapAsset {
  source: number;
  width: number;
  height: number;
}

const ASSETS: Record<string, MapAsset> = {
  'seoul-ktx-overview': {
    source: require('./seoul-ktx-overview.png'),
    width: 2657,
    height: 1786,
  },
  'seoul-arex-exploded': {
    source: require('./seoul-arex-exploded.png'),
    width: 2657,
    height: 1786,
  },
};

export function getMapAsset(assetKey: string | undefined): MapAsset | null {
  if (!assetKey) return null;
  return ASSETS[assetKey] ?? null;
}

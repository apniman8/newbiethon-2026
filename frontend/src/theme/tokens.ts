// Design tokens sourced from the Claude Design handoff:
// - components/fig-tokens.css (design system source of truth)
// - Frontend Spec.dc.html section 3 (confirmed hex values for this app)
// RN has no CSS custom properties, so these are plain JS constants instead.

export const colors = {
  primary: '#3366FF',
  primaryStrong: '#2B54D6',

  labelStrong: '#111418',
  labelNeutral: '#4B5563',
  labelAlternative: '#6B7280',

  fillAlternative: '#F2F4F7',
  fillNormal: 'rgba(112,115,124,0.08)',
  lineNormalNormal: '#E8EBF0',
  lineLight: '#D7DBE2',

  background: '#FFFFFF',
  inverseBackground: '#1B1C1E',

  calloutBackground: '#EBF2FF',
  routeOverlay: '#E8352B',
  statusPositive: '#00BF40',

  white: '#FFFFFF',
  black: '#000000',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 10,
  lg: 12,
  xl: 14,
  xxl: 16,
  pill: 999,
} as const;

// Pretendard is the spec'd typeface; falls back to the platform system font
// until Pretendard's font files are added via expo-font.
export const fontFamily = {
  base: undefined,
} as const;

export const typography = {
  screenTitle: { fontSize: 28, fontWeight: '700' as const, lineHeight: 35 },
  // The confirmed handoff (Guide Screen UX Review.dc.html, id="3") leads every
  // screen with one oversized, landmark-first line of text.
  heroTitle: { fontSize: 34, fontWeight: '700' as const, lineHeight: 39, letterSpacing: -0.6 },
  eyebrow: { fontSize: 12, fontWeight: '700' as const, letterSpacing: 0.5 },
  sectionLabel: { fontSize: 13, fontWeight: '600' as const, letterSpacing: 0.4 },
  body: { fontSize: 15, fontWeight: '600' as const },
  bodySecondary: { fontSize: 13, fontWeight: '400' as const },
  instruction: { fontSize: 20, fontWeight: '600' as const, lineHeight: 28 },
  button: { fontSize: 17, fontWeight: '700' as const },
  caption: { fontSize: 12, fontWeight: '600' as const },
} as const;

export const layout = {
  screenPaddingH: 24,
  cardRadius: 16,
  mapPanelHeight: 360,
} as const;

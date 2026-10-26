/**
 * Polaris mobile palette — mirrors the web dark theme
 * (polaris-fe/src/styles.css `[data-theme='dark']`). The app is dark-only,
 * like the web. Translucent web surfaces are flattened to opaque colors
 * because RN has no backdrop blur behind them.
 */
export const colors = {
  bg: '#0c0c0f',
  surface: '#141417',
  surface2: '#1c1c21',
  surface3: '#242429',

  border: 'rgba(255,255,255,0.12)',
  borderSubtle: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(255,255,255,0.35)',

  fg: '#ffffff',
  fgMuted: '#9394a1',
  fgSubtle: '#6d6f7e',

  accent: '#8b5cf6',
  accentStrong: '#c4b5fd',
  accentFg: '#ffffff',
  accentSoft: 'rgba(139,92,246,0.2)',

  success: '#4ade80',
  successSoft: 'rgba(52,211,153,0.12)',
  warning: '#fbbf24',
  warningSoft: 'rgba(251,191,36,0.12)',
  danger: '#fb7185',
  dangerSoft: 'rgba(251,113,133,0.12)',
  info: '#60a5fa',
  infoSoft: 'rgba(96,165,250,0.12)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  full: 999,
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
} as const;

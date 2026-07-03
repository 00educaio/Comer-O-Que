export const colors = {
  primary: '#E32636',
  primaryDark: '#B9172A',
  onPrimary: '#FFFFFF',
  background: '#FFF8EF',
  surface: '#FFFFFF',
  surfaceTranslucent: 'rgba(255, 255, 255, 0.68)',
  text: '#2D1B1E',
  textMuted: '#6F555A',
  cardBorder: '#2D1B1E',
  pink: '#FFD6DC',
  yellow: '#FFE79A',
  mint: '#CFF3DF',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 12,
  md: 20,
  lg: 28,
  pill: 999,
} as const;

export const shadows = {
  card: {
    boxShadow: '0 6px 8px rgba(125, 38, 49, 0.18)',
    elevation: 4,
  },
} as const;

export const typography = {
  title: {
    fontSize: 38,
    fontWeight: '900',
    lineHeight: 44,
  },
  heading: {
    fontSize: 23,
    fontWeight: '800',
    lineHeight: 29,
  },
  body: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 23,
  },
  button: {
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 22,
  },
  caption: {
    fontSize: 11,
    fontWeight: '900',
    lineHeight: 14,
  },
} as const;

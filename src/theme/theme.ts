export const colors = {
  primary: '#E33A39',
  primaryDark: '#B91D2D',
  primarySoft: '#FFD9D4',
  primaryGlow: '#FFE8E2',
  onPrimary: '#FFF9F5',
  background: '#FFF7F1',
  backgroundCanvas: '#F9E9DA',
  surface: '#FFFFFF',
  surfaceWarm: '#FFF4EC',
  surfaceRaised: '#FFFDFC',
  surfaceTranslucent: 'rgba(255, 255, 255, 0.76)',
  text: '#2F161A',
  textMuted: '#6E5056',
  textSoft: '#9A7C82',
  cardBorder: '#3A1D21',
  cardBorderSoft: 'rgba(58, 29, 33, 0.14)',
  pink: '#FFD8E6',
  yellow: '#FFE59A',
  mint: '#D4F3DF',
  peach: '#FFC8AF',
  coral: '#FF8B6A',
  success: '#2E8A5A',
  warning: '#CB7222',
  shadow: 'rgba(111, 32, 41, 0.14)',
  shadowStrong: 'rgba(111, 32, 41, 0.22)',
} as const;

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const radius = {
  xs: 10,
  sm: 16,
  md: 22,
  lg: 30,
  xl: 40,
  pill: 999,
} as const;

export const shadows = {
  card: {
    elevation: 6,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 1,
    shadowRadius: 18,
  },
  floating: {
    elevation: 12,
    shadowColor: colors.shadowStrong,
    shadowOffset: {
      width: 0,
      height: 18,
    },
    shadowOpacity: 1,
    shadowRadius: 28,
  },
  soft: {
    elevation: 3,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.8,
    shadowRadius: 12,
  },
} as const;

export const typography = {
  hero: {
    fontSize: 42,
    fontWeight: '900',
    lineHeight: 46,
    letterSpacing: -1.1,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    lineHeight: 40,
    letterSpacing: -0.8,
  },
  heading: {
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 30,
  },
  subheading: {
    fontSize: 19,
    fontWeight: '800',
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
  },
  bodyStrong: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
  },
  button: {
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
  },
  label: {
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 16,
    letterSpacing: 1.2,
  },
  caption: {
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 14,
  },
  code: {
    fontSize: 34,
    fontWeight: '900',
    lineHeight: 38,
    letterSpacing: 4,
  },
} as const;

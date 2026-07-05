import { Platform } from 'react-native';

export const colors = {
  primary: '#E12B2D',
  primaryStrong: '#C92022',
  primaryDark: '#89131D',
  primarySoft: '#FFD1CC',
  primaryGlow: '#FFE6E1',
  primaryWash: '#FFF1ED',
  onPrimary: '#FFF9F6',
  background: '#FFF8F2',
  backgroundCanvas: '#FFE2D7',
  surface: '#FFFCFA',
  surfaceWarm: '#FFF0E7',
  surfaceRaised: '#FFFFFF',
  surfaceTinted: '#FFF5F2',
  surfaceAccent: '#FFE7DE',
  surfaceTranslucent: 'rgba(255, 255, 255, 0.84)',
  text: '#311217',
  textMuted: '#755057',
  textSoft: '#AE8086',
  textInverted: '#FFF7F4',
  cardBorder: '#5E2127',
  cardBorderSoft: 'rgba(94, 33, 39, 0.14)',
  pink: '#FFD0DF',
  yellow: '#FFD66C',
  mint: '#D5F2D8',
  peach: '#FFC3A7',
  coral: '#FF8768',
  success: '#227B49',
  warning: '#B25B18',
  danger: '#C82939',
  shadow: 'rgba(113, 28, 39, 0.14)',
  shadowStrong: 'rgba(113, 28, 39, 0.24)',
} as const;

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 10,
  smd: 12,
  md: 16,
  mdl: 20,
  lg: 24,
  xl: 32,
  xxl: 44,
  xxxl: 60,
  jumbo: 76,
} as const;

export const radius = {
  xs: 10,
  sm: 16,
  md: 22,
  lg: 30,
  xl: 38,
  hero: 44,
  pill: 999,
} as const;

export const shadows = {
  card: {
    elevation: 8,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  floating: {
    elevation: 14,
    shadowColor: colors.shadowStrong,
    shadowOffset: {
      width: 0,
      height: 18,
    },
    shadowOpacity: 1,
    shadowRadius: 30,
  },
  soft: {
    elevation: 4,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.8,
    shadowRadius: 12,
  },
} as const;

export const fontFamilies = {
  body: 'Nunito_400Regular',
  bodyMedium: 'Nunito_600SemiBold',
  bodyBold: 'Nunito_800ExtraBold',
  bodyBlack: 'Nunito_900Black',
  display: 'Fredoka_700Bold',
  displayMedium: 'Fredoka_600SemiBold',
  mono:
    Platform.select({
      ios: 'Menlo',
      web: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
      default: 'monospace',
    }) ?? 'monospace',
} as const;

export const typography = {
  hero: {
    fontFamily: fontFamilies.display,
    fontSize: 44,
    letterSpacing: -0.9,
    lineHeight: 48,
  },
  title: {
    fontFamily: fontFamilies.display,
    fontSize: 34,
    letterSpacing: -0.8,
    lineHeight: 38,
  },
  heading: {
    fontFamily: fontFamilies.displayMedium,
    fontSize: 26,
    lineHeight: 30,
  },
  subheading: {
    fontFamily: fontFamilies.displayMedium,
    fontSize: 20,
    lineHeight: 25,
  },
  body: {
    fontFamily: fontFamilies.body,
    fontSize: 17,
    lineHeight: 24,
  },
  bodyStrong: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: 17,
    lineHeight: 24,
  },
  button: {
    fontFamily: fontFamilies.bodyBlack,
    fontSize: 17,
    lineHeight: 22,
  },
  label: {
    fontFamily: fontFamilies.bodyBlack,
    fontSize: 12,
    letterSpacing: 1.2,
    lineHeight: 16,
  },
  caption: {
    fontFamily: fontFamilies.bodyBold,
    fontSize: 13,
    lineHeight: 16,
  },
  code: {
    fontFamily: fontFamilies.display,
    fontSize: 34,
    letterSpacing: 4.2,
    lineHeight: 38,
  },
} as const;

export const layout = {
  contentWidth: 760,
} as const;

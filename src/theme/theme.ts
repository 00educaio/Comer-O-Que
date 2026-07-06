import { Platform } from 'react-native';

export const colors = {
  primary: '#F0000A',
  primaryStrong: '#D4000D',
  primaryDark: '#8E0010',
  primarySoft: '#FFC7CA',
  primaryGlow: '#FFE7E8',
  primaryWash: '#FFF3F3',
  onPrimary: '#FFFFFF',
  background: '#F7F3F1',
  backgroundCanvas: '#F0000A',
  surface: '#FFFFFF',
  surfaceWarm: '#F6F1EF',
  surfaceRaised: '#FFFFFF',
  surfaceTinted: '#FFF6F6',
  surfaceAccent: '#FFE6E7',
  surfaceTranslucent: 'rgba(255, 255, 255, 0.9)',
  text: '#241C1A',
  textMuted: '#6E625E',
  textSoft: '#9B8E89',
  textInverted: '#FFFFFF',
  cardBorder: '#E2D7D3',
  cardBorderSoft: 'rgba(54, 31, 27, 0.1)',
  pink: '#FFD8DB',
  yellow: '#FFD45C',
  mint: '#DDF1E1',
  peach: '#FFD9CA',
  coral: '#FF775E',
  success: '#267A49',
  warning: '#9D541D',
  danger: '#C71F32',
  shadow: 'rgba(65, 31, 25, 0.1)',
  shadowStrong: 'rgba(65, 31, 25, 0.16)',
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
  xs: 8,
  sm: 14,
  md: 20,
  lg: 26,
  xl: 30,
  hero: 34,
  pill: 999,
} as const;

export const shadows = {
  card: {
    elevation: 3,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 1,
    shadowRadius: 14,
  },
  floating: {
    elevation: 7,
    shadowColor: colors.shadowStrong,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 1,
    shadowRadius: 22,
  },
  soft: {
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.7,
    shadowRadius: 8,
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
    fontSize: 40,
    letterSpacing: -1,
    lineHeight: 43,
  },
  title: {
    fontFamily: fontFamilies.display,
    fontSize: 32,
    letterSpacing: -0.8,
    lineHeight: 35,
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
    fontSize: 16,
    lineHeight: 22,
  },
  bodyStrong: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: 16,
    lineHeight: 22,
  },
  button: {
    fontFamily: fontFamilies.bodyBlack,
    fontSize: 17,
    lineHeight: 22,
  },
  label: {
    fontFamily: fontFamilies.bodyBlack,
    fontSize: 11,
    letterSpacing: 1.1,
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

import type { ReactNode } from 'react';
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { colors } from '@/theme/theme';

export type AmbientTone =
  | 'default'
  | 'home'
  | 'interview'
  | 'roulette'
  | 'match';

type AmbientBackgroundProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  tone?: AmbientTone;
};

const palettes: Record<
  AmbientTone,
  {
    background: [string, string, string];
    orbPrimary: string;
    orbSecondary: string;
    ribbon: string;
    sparkle: string;
    stroke: string;
  }
> = {
  default: {
    background: ['#FFF8F2', '#FFF0EA', '#FFE7DE'],
    orbPrimary: 'rgba(225, 43, 45, 0.14)',
    orbSecondary: 'rgba(255, 208, 223, 0.34)',
    ribbon: 'rgba(255, 195, 167, 0.46)',
    sparkle: 'rgba(255, 214, 108, 0.58)',
    stroke: 'rgba(225, 43, 45, 0.08)',
  },
  home: {
    background: ['#FFF8F2', '#FFECE3', '#FFDCD0'],
    orbPrimary: 'rgba(225, 43, 45, 0.18)',
    orbSecondary: 'rgba(213, 242, 216, 0.66)',
    ribbon: 'rgba(255, 135, 104, 0.18)',
    sparkle: 'rgba(255, 214, 108, 0.72)',
    stroke: 'rgba(255, 195, 167, 0.74)',
  },
  interview: {
    background: ['#FFF8F3', '#FFF0EA', '#FFE4D5'],
    orbPrimary: 'rgba(255, 208, 223, 0.58)',
    orbSecondary: 'rgba(255, 195, 167, 0.46)',
    ribbon: 'rgba(225, 43, 45, 0.12)',
    sparkle: 'rgba(225, 43, 45, 0.16)',
    stroke: 'rgba(225, 43, 45, 0.1)',
  },
  roulette: {
    background: ['#FFF8F1', '#FFF2E3', '#FFE5C5'],
    orbPrimary: 'rgba(255, 214, 108, 0.46)',
    orbSecondary: 'rgba(213, 242, 216, 0.46)',
    ribbon: 'rgba(255, 135, 104, 0.18)',
    sparkle: 'rgba(255, 135, 104, 0.22)',
    stroke: 'rgba(255, 208, 223, 0.64)',
  },
  match: {
    background: ['#FFF7F2', '#FFEDEA', '#FFE0DB'],
    orbPrimary: 'rgba(255, 208, 223, 0.58)',
    orbSecondary: 'rgba(213, 242, 216, 0.44)',
    ribbon: 'rgba(225, 43, 45, 0.14)',
    sparkle: 'rgba(255, 214, 108, 0.52)',
    stroke: 'rgba(225, 43, 45, 0.09)',
  },
};

export function AmbientBackground({
  children,
  style,
  tone = 'default',
}: AmbientBackgroundProps) {
  const palette = palettes[tone];

  return (
    <View style={[styles.container, style]}>
      <View pointerEvents="none" style={styles.layer}>
        <LinearGradient
          colors={palette.background}
          end={{ x: 0.9, y: 1 }}
          start={{ x: 0.06, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.ribbon, { backgroundColor: palette.ribbon }]} />
        <View
          style={[
            styles.orb,
            styles.topOrb,
            { backgroundColor: palette.orbPrimary },
          ]}
        />
        <View
          style={[
            styles.orb,
            styles.sideOrb,
            { backgroundColor: palette.orbSecondary },
          ]}
        />
        <View
          style={[
            styles.orb,
            styles.bottomOrb,
            { backgroundColor: palette.sparkle },
          ]}
        />
        <View style={[styles.ring, { borderColor: palette.stroke }]} />
        <View style={[styles.ring, styles.ringSecondary, { borderColor: palette.stroke }]} />
        <View
          style={[
            styles.sparkle,
            styles.sparkleOne,
            { backgroundColor: palette.sparkle },
          ]}
        />
        <View
          style={[
            styles.sparkle,
            styles.sparkleTwo,
            { backgroundColor: palette.orbPrimary },
          ]}
        />
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    minHeight: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  layer: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  ribbon: {
    borderRadius: 42,
    height: 130,
    left: '-8%',
    position: 'absolute',
    right: '-26%',
    top: -48,
    transform: [{ rotate: '-7deg' }],
  },
  orb: {
    borderRadius: 999,
    position: 'absolute',
  },
  topOrb: {
    height: 320,
    right: -100,
    top: -80,
    width: 320,
  },
  sideOrb: {
    height: 250,
    left: -100,
    top: 240,
    width: 250,
  },
  bottomOrb: {
    bottom: 90,
    height: 170,
    right: 28,
    width: 170,
  },
  ring: {
    borderRadius: 999,
    borderWidth: 1,
    height: 210,
    left: -48,
    position: 'absolute',
    top: 30,
    width: 210,
  },
  ringSecondary: {
    bottom: 160,
    left: undefined,
    right: -60,
    top: undefined,
  },
  sparkle: {
    borderRadius: 999,
    opacity: 0.78,
    position: 'absolute',
  },
  sparkleOne: {
    height: 18,
    right: 70,
    top: 164,
    width: 18,
  },
  sparkleTwo: {
    bottom: 168,
    height: 12,
    left: 54,
    width: 12,
  },
});

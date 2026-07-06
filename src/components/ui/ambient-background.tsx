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
    background: ['#F7F3F1', '#FBF8F7', '#F7F3F1'],
    orbPrimary: 'rgba(240, 0, 10, 0.08)',
    orbSecondary: 'rgba(240, 0, 10, 0.03)',
    ribbon: 'rgba(240, 0, 10, 0.05)',
    sparkle: 'rgba(240, 0, 10, 0.08)',
    stroke: 'rgba(240, 0, 10, 0.04)',
  },
  home: {
    background: ['#F7F3F1', '#FBF8F7', '#F7F3F1'],
    orbPrimary: 'rgba(240, 0, 10, 0.1)',
    orbSecondary: 'rgba(240, 0, 10, 0.03)',
    ribbon: 'rgba(240, 0, 10, 0.05)',
    sparkle: 'rgba(255, 212, 92, 0.14)',
    stroke: 'rgba(240, 0, 10, 0.04)',
  },
  interview: {
    background: ['#F7F3F1', '#FBF8F7', '#F7F3F1'],
    orbPrimary: 'rgba(240, 0, 10, 0.1)',
    orbSecondary: 'rgba(240, 0, 10, 0.03)',
    ribbon: 'rgba(240, 0, 10, 0.05)',
    sparkle: 'rgba(240, 0, 10, 0.08)',
    stroke: 'rgba(240, 0, 10, 0.04)',
  },
  roulette: {
    background: ['#F7F3F1', '#FBF8F7', '#F7F3F1'],
    orbPrimary: 'rgba(240, 0, 10, 0.1)',
    orbSecondary: 'rgba(255, 212, 92, 0.06)',
    ribbon: 'rgba(240, 0, 10, 0.05)',
    sparkle: 'rgba(255, 212, 92, 0.14)',
    stroke: 'rgba(240, 0, 10, 0.04)',
  },
  match: {
    background: ['#F7F3F1', '#FBF8F7', '#F7F3F1'],
    orbPrimary: 'rgba(240, 0, 10, 0.1)',
    orbSecondary: 'rgba(240, 0, 10, 0.03)',
    ribbon: 'rgba(240, 0, 10, 0.05)',
    sparkle: 'rgba(240, 0, 10, 0.08)',
    stroke: 'rgba(240, 0, 10, 0.04)',
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
    borderRadius: 32,
    height: 92,
    left: '-8%',
    position: 'absolute',
    right: '-26%',
    top: -66,
    transform: [{ rotate: '-7deg' }],
  },
  orb: {
    borderRadius: 999,
    position: 'absolute',
  },
  topOrb: {
    height: 220,
    right: -120,
    top: -110,
    width: 220,
  },
  sideOrb: {
    height: 160,
    left: -120,
    top: 340,
    width: 160,
  },
  bottomOrb: {
    bottom: 90,
    height: 110,
    right: 28,
    width: 110,
  },
  ring: {
    borderRadius: 999,
    borderWidth: 1,
    height: 150,
    left: -48,
    position: 'absolute',
    top: 30,
    width: 150,
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

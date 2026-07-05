import type { ReactNode } from 'react';
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors } from '@/theme/theme';

type AmbientTone = 'default' | 'home' | 'interview' | 'roulette' | 'match';

type AmbientBackgroundProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  tone?: AmbientTone;
};

const palettes: Record<
  AmbientTone,
  {
    orbPrimary: string;
    orbSecondary: string;
    sparkle: string;
    stroke: string;
  }
> = {
  default: {
    orbPrimary: 'rgba(255, 141, 123, 0.14)',
    orbSecondary: 'rgba(255, 216, 230, 0.32)',
    sparkle: 'rgba(255, 229, 154, 0.6)',
    stroke: 'rgba(227, 58, 57, 0.08)',
  },
  home: {
    orbPrimary: 'rgba(227, 58, 57, 0.12)',
    orbSecondary: 'rgba(212, 243, 223, 0.62)',
    sparkle: 'rgba(255, 229, 154, 0.75)',
    stroke: 'rgba(255, 200, 175, 0.6)',
  },
  interview: {
    orbPrimary: 'rgba(255, 216, 230, 0.54)',
    orbSecondary: 'rgba(255, 200, 175, 0.44)',
    sparkle: 'rgba(227, 58, 57, 0.12)',
    stroke: 'rgba(227, 58, 57, 0.1)',
  },
  roulette: {
    orbPrimary: 'rgba(255, 229, 154, 0.42)',
    orbSecondary: 'rgba(212, 243, 223, 0.5)',
    sparkle: 'rgba(255, 139, 106, 0.2)',
    stroke: 'rgba(255, 216, 230, 0.64)',
  },
  match: {
    orbPrimary: 'rgba(255, 216, 230, 0.56)',
    orbSecondary: 'rgba(212, 243, 223, 0.42)',
    sparkle: 'rgba(255, 229, 154, 0.5)',
    stroke: 'rgba(227, 58, 57, 0.08)',
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
  orb: {
    borderRadius: 999,
    position: 'absolute',
  },
  topOrb: {
    height: 280,
    right: -80,
    top: -70,
    width: 280,
  },
  sideOrb: {
    height: 220,
    left: -90,
    top: 220,
    width: 220,
  },
  bottomOrb: {
    bottom: 80,
    height: 150,
    right: 30,
    width: 150,
  },
  ring: {
    borderRadius: 999,
    borderWidth: 1,
    height: 190,
    left: -40,
    position: 'absolute',
    top: 32,
    width: 190,
  },
  sparkle: {
    borderRadius: 999,
    opacity: 0.7,
    position: 'absolute',
  },
  sparkleOne: {
    height: 18,
    right: 68,
    top: 148,
    width: 18,
  },
  sparkleTwo: {
    bottom: 160,
    height: 12,
    left: 54,
    width: 12,
  },
});

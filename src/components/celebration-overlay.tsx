import { useEffect, useEffectEvent, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { colors, radius, shadows, spacing, typography } from '@/theme/theme';

const PIECE_COUNT = 18;

const confettiColors = [
  colors.primary,
  colors.primaryStrong,
  colors.primaryDark,
  colors.yellow,
  colors.coral,
  colors.onPrimary,
] as const;

type CelebrationTone = 'default' | 'interview' | 'match' | 'roulette';

type CelebrationOverlayProps = {
  message: string;
  skipInitialTrigger?: boolean;
  title: string;
  tone?: CelebrationTone;
  triggerKey: number | string | null;
};

type PieceAnimation = {
  progress: Animated.Value;
  sway: Animated.Value;
};

function getTonePalette(tone: CelebrationTone) {
  switch (tone) {
    case 'interview':
      return {
        badgeBackground: colors.primary,
        badgeBorder: colors.primaryStrong,
        accent: colors.onPrimary,
        message: colors.onPrimary,
      };
    case 'roulette':
      return {
        badgeBackground: colors.primary,
        badgeBorder: colors.primaryStrong,
        accent: colors.onPrimary,
        message: colors.onPrimary,
      };
    case 'match':
      return {
        badgeBackground: colors.primary,
        badgeBorder: colors.primaryStrong,
        accent: colors.onPrimary,
        message: colors.onPrimary,
      };
    default:
      return {
        badgeBackground: colors.primary,
        badgeBorder: colors.primaryStrong,
        accent: colors.onPrimary,
        message: colors.onPrimary,
      };
  }
}

function createPieceMetrics(index: number, width: number, height: number) {
  const midpoint = (PIECE_COUNT - 1) / 2;
  const normalized = (index - midpoint) / midpoint;
  const safeWidth = Math.max(width, 320);
  const travelWidth = Math.min(safeWidth * 0.34, 160);

  return {
    color: confettiColors[index % confettiColors.length],
    delay: (index % 6) * 35,
    duration: 980 + (index % 5) * 95,
    endX: normalized * travelWidth + (index % 2 === 0 ? -16 : 16),
    opacityPeak: 0.12 + (index % 4) * 0.04,
    rotation: (index % 2 === 0 ? 1 : -1) * (210 + index * 24),
    size: 10 + (index % 4) * 4,
    startX: normalized * 34,
    sway: 14 + (index % 4) * 7,
    topOffset: 10 + (index % 3) * 12,
    travelY: Math.max(320, Math.min(height * 0.72, 540)),
    widthMultiplier: index % 3 === 0 ? 1 : 0.7,
  };
}

export function CelebrationOverlay({
  message,
  skipInitialTrigger = false,
  title,
  tone = 'default',
  triggerKey,
}: CelebrationOverlayProps) {
  const { width, height } = useWindowDimensions();
  const usableWidth = Math.min(width, 720);
  const palette = getTonePalette(tone);
  const [isVisible, setIsVisible] = useState(false);
  const [pieceAnimations] = useState<PieceAnimation[]>(() =>
    Array.from({ length: PIECE_COUNT }, () => ({
      progress: new Animated.Value(0),
      sway: new Animated.Value(0),
    })),
  );
  const [badgeOpacity] = useState(() => new Animated.Value(0));
  const [badgeScale] = useState(() => new Animated.Value(0.9));
  const [badgeTranslateY] = useState(() => new Animated.Value(-18));
  const didMountRef = useRef(false);
  const previousTriggerRef = useRef<string | null>(null);
  const runningAnimationRef = useRef<Animated.CompositeAnimation | null>(null);

  const startCelebration = useEffectEvent(() => {
    const pieceMetrics = Array.from({ length: PIECE_COUNT }, (_, index) =>
      createPieceMetrics(index, usableWidth, height),
    );

    runningAnimationRef.current?.stop();
    setIsVisible(true);

    badgeOpacity.setValue(0);
    badgeScale.setValue(0.9);
    badgeTranslateY.setValue(-18);

    for (const animation of pieceAnimations) {
      animation.progress.setValue(0);
      animation.sway.setValue(0);
    }

    const maxPieceDuration = pieceMetrics.reduce(
      (highestDuration, metrics) =>
        Math.max(highestDuration, metrics.delay + metrics.duration),
      0,
    );

    const confettiAnimations = pieceAnimations.map((animation, index) => {
      const metrics = pieceMetrics[index];

      return Animated.parallel([
        Animated.timing(animation.progress, {
          delay: metrics.delay,
          duration: metrics.duration,
          easing: Easing.out(Easing.quad),
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(metrics.delay),
          Animated.timing(animation.sway, {
            duration: Math.round(metrics.duration * 0.34),
            easing: Easing.inOut(Easing.sin),
            toValue: 1,
            useNativeDriver: true,
          }),
          Animated.timing(animation.sway, {
            duration: Math.round(metrics.duration * 0.33),
            easing: Easing.inOut(Easing.sin),
            toValue: -1,
            useNativeDriver: true,
          }),
          Animated.timing(animation.sway, {
            duration: Math.round(metrics.duration * 0.33),
            easing: Easing.inOut(Easing.sin),
            toValue: 0,
            useNativeDriver: true,
          }),
        ]),
      ]);
    });

    const badgeAnimation = Animated.sequence([
      Animated.parallel([
        Animated.timing(badgeOpacity, {
          duration: 180,
          easing: Easing.out(Easing.quad),
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.spring(badgeScale, {
          bounciness: 12,
          speed: 18,
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(badgeTranslateY, {
          duration: 240,
          easing: Easing.out(Easing.cubic),
          toValue: 0,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(Math.max(420, maxPieceDuration - 620)),
      Animated.parallel([
        Animated.timing(badgeOpacity, {
          duration: 220,
          easing: Easing.in(Easing.quad),
          toValue: 0,
          useNativeDriver: true,
        }),
        Animated.timing(badgeScale, {
          duration: 220,
          easing: Easing.in(Easing.quad),
          toValue: 0.96,
          useNativeDriver: true,
        }),
        Animated.timing(badgeTranslateY, {
          duration: 220,
          easing: Easing.in(Easing.quad),
          toValue: -12,
          useNativeDriver: true,
        }),
      ]),
    ]);

    runningAnimationRef.current = Animated.parallel([
      ...confettiAnimations,
      badgeAnimation,
    ]);

    runningAnimationRef.current.start(({ finished }) => {
      if (finished) {
        setIsVisible(false);
      }
    });
  });

  useEffect(() => {
    return () => {
      runningAnimationRef.current?.stop();
    };
  }, []);

  useEffect(() => {
    let frameId: number | null = null;
    const normalizedTrigger =
      typeof triggerKey === 'number' || typeof triggerKey === 'string'
        ? String(triggerKey)
        : null;
    const scheduleCelebration = () => {
      frameId = requestAnimationFrame(() => {
        startCelebration();
      });
    };

    if (!didMountRef.current) {
      didMountRef.current = true;
      previousTriggerRef.current = normalizedTrigger;

      if (normalizedTrigger && !skipInitialTrigger) {
        scheduleCelebration();
      }

      return () => {
        if (frameId !== null) {
          cancelAnimationFrame(frameId);
        }
      };
    }

    if (!normalizedTrigger) {
      previousTriggerRef.current = null;
      return () => {
        if (frameId !== null) {
          cancelAnimationFrame(frameId);
        }
      };
    }

    if (normalizedTrigger === previousTriggerRef.current) {
      return () => {
        if (frameId !== null) {
          cancelAnimationFrame(frameId);
        }
      };
    }

    previousTriggerRef.current = normalizedTrigger;
    scheduleCelebration();

    return () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [height, skipInitialTrigger, triggerKey, width]);

  if (!isVisible) {
    return null;
  }

  return (
    <View pointerEvents="none" style={styles.container}>
      {pieceAnimations.map((animation, index) => {
        const metrics = createPieceMetrics(index, usableWidth, height);
        const opacity = animation.progress.interpolate({
          inputRange: [0, metrics.opacityPeak, 0.82, 1],
          outputRange: [0, 1, 1, 0],
        });
        const translateY = animation.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [-28 - metrics.topOffset, metrics.travelY],
        });
        const driftX = animation.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [metrics.startX, metrics.endX],
        });
        const swayX = animation.sway.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: [-metrics.sway, 0, metrics.sway],
        });
        const rotate = animation.progress.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', `${metrics.rotation}deg`],
        });

        return (
          <Animated.View
            key={`celebration-piece-${index}`}
            style={[
              styles.pieceAnchor,
              { left: '50%', top: spacing.sm },
              {
                opacity,
                transform: [
                  { translateX: Animated.add(driftX, swayX) },
                  { translateY },
                  { rotate },
                ],
              },
            ]}>
            <View
              style={[
                styles.piece,
                {
                  backgroundColor: metrics.color,
                  borderRadius: metrics.widthMultiplier === 1 ? radius.pill : radius.xs,
                  height: metrics.size * 1.55,
                  width: metrics.size * metrics.widthMultiplier,
                },
              ]}
            />
          </Animated.View>
        );
      })}

      <Animated.View
        accessibilityLiveRegion="polite"
        accessibilityRole="alert"
        style={[
          styles.badge,
          {
            backgroundColor: palette.badgeBackground,
            borderColor: palette.badgeBorder,
            opacity: badgeOpacity,
            transform: [{ scale: badgeScale }, { translateY: badgeTranslateY }],
          },
        ]}>
        <Text style={[styles.badgeTitle, { color: palette.accent }]}>{title}</Text>
        <Text style={[styles.badgeMessage, { color: palette.message }]}>{message}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    ...shadows.floating,
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: radius.xl,
    borderWidth: 2,
    marginTop: spacing.xl,
    maxWidth: 340,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    width: '88%',
  },
  badgeMessage: {
    ...typography.body,
    color: colors.text,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  badgeTitle: {
    ...typography.heading,
    textAlign: 'center',
  },
  container: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 20,
  },
  piece: {
    shadowColor: colors.shadowStrong,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.28,
    shadowRadius: 8,
  },
  pieceAnchor: {
    position: 'absolute',
  },
});

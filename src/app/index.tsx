import { Image } from 'expo-image';
import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ScreenShell } from '@/components/ui/app-shell';
import { AppPill, Reveal, SurfaceCard } from '@/components/ui/app-primitives';
import { colors, radius, spacing, typography } from '@/theme/theme';

type HomeOption = {
  badge: string;
  description: string;
  href: Href;
  image: number;
  title: string;
};

const homeOptions: HomeOption[] = [
  {
    badge: '8 perguntas',
    title: 'Modo Entrevista',
    description: 'Responda rapidinho e receba um palpite certeiro.',
    href: '/interview',
    image: require('../../assets/images/ComerOQue/mode-interview-illustration.png'),
  },
  {
    badge: '1 toque',
    title: 'Roleta',
    description: 'Escolha uma categoria e deixe a sorte decidir.',
    href: '/roulette',
    image: require('../../assets/images/ComerOQue/mode-roulette-illustration.png'),
  },
  {
    badge: '2 pessoas',
    title: 'ModoMatch',
    description: 'Curtam os mesmos pratos e encontrem o match.',
    href: '/match',
    image: require('../../assets/images/ComerOQue/mode-match-coming-soon-illustration.png'),
  },
];

export default function HomeScreen() {
  return (
    <ScreenShell
      contentContainerStyle={styles.content}
      edges={['top', 'bottom']}
      tone="home">
      <Reveal>
        <View style={styles.brandHeader}>
          <Image
            accessible={false}
            contentFit="contain"
            source={require('../../assets/images/ComerOQue/logo-horizontal-comer-o-que.png')}
            style={styles.logo}
          />
          <Text accessibilityRole="header" style={styles.pageTitle}>
            Escolha seu jeito de decidir
          </Text>
        </View>
      </Reveal>

      <View style={styles.options}>
        {homeOptions.map((option, index) => (
          <Reveal delay={80 + index * 70} key={option.title}>
            <Pressable
              accessibilityHint={option.description}
              accessibilityLabel={option.title}
              accessibilityRole="button"
              onPress={() => router.push(option.href)}
              style={({ pressed }) => [
                styles.cardPressable,
                pressed && styles.cardPressed,
              ]}>
              <SurfaceCard contentStyle={styles.modeCardContent} style={styles.modeCard}>
                <View style={styles.imageFrame}>
                  <Image
                    accessible={false}
                    contentFit="cover"
                    contentPosition="center"
                    source={option.image}
                    style={styles.modeImage}
                  />
                  <View style={styles.imageBadge}>
                    <AppPill
                      label={option.badge}
                      style={styles.badge}
                      textStyle={styles.badgeText}
                      tone="cream"
                    />
                  </View>
                </View>

                <View style={styles.modeCopy}>
                  <View style={styles.titleRow}>
                    <Text style={styles.modeTitle}>{option.title}</Text>
                    <View style={styles.arrow}>
                      <Text style={styles.arrowText}>›</Text>
                    </View>
                  </View>
                  <Text style={styles.modeDescription}>{option.description}</Text>
                </View>
              </SurfaceCard>
            </Pressable>
          </Reveal>
        ))}
      </View>

      <Reveal delay={320}>
        <Pressable
          accessibilityHint="Abre a área para enviar sugestão, elogio ou problema"
          accessibilityLabel="Abrir sugestões"
          accessibilityRole="button"
          onPress={() => router.push('/suggestions')}
          style={({ pressed }) => [
            styles.cardPressable,
            pressed && styles.cardPressed,
          ]}>
          <SurfaceCard contentStyle={styles.feedbackContent} style={styles.feedbackCard}>
            <View style={styles.feedbackIcon}>
              <Text style={styles.feedbackEmoji}>💌</Text>
            </View>
            <View style={styles.feedbackCopy}>
              <Text style={styles.feedbackTitle}>Tem uma sugestão?</Text>
              <Text style={styles.feedbackText}>Conta pra gente.</Text>
            </View>
            <Text style={styles.feedbackArrow}>›</Text>
          </SurfaceCard>
        </Pressable>
      </Reveal>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  arrow: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  arrowText: {
    color: colors.onPrimary,
    fontFamily: typography.heading.fontFamily,
    fontSize: 32,
    lineHeight: 34,
    marginTop: -2,
  },
  badge: {
    backgroundColor: colors.surfaceRaised,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  badgeText: {
    color: colors.primaryDark,
  },
  brandHeader: {
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.xs,
  },
  cardPressable: {
    borderRadius: radius.xl,
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  content: {
    gap: spacing.lg,
  },
  feedbackArrow: {
    color: colors.primary,
    fontFamily: typography.heading.fontFamily,
    fontSize: 34,
  },
  feedbackCard: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.primarySoft,
  },
  feedbackContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
  },
  feedbackCopy: {
    flex: 1,
  },
  feedbackEmoji: {
    fontSize: 28,
  },
  feedbackIcon: {
    alignItems: 'center',
    backgroundColor: colors.primaryGlow,
    borderRadius: radius.md,
    height: 54,
    justifyContent: 'center',
    width: 54,
  },
  feedbackText: {
    ...typography.body,
    color: colors.textMuted,
  },
  feedbackTitle: {
    ...typography.subheading,
    color: colors.text,
  },
  imageBadge: {
    left: spacing.md,
    position: 'absolute',
    top: spacing.md,
  },
  imageFrame: {
    backgroundColor: colors.primary,
    height: 238,
    overflow: 'hidden',
  },
  logo: {
    aspectRatio: 3,
    maxWidth: 420,
    width: '100%',
  },
  modeCard: {
    borderColor: colors.cardBorderSoft,
  },
  modeCardContent: {
    padding: 0,
  },
  modeCopy: {
    backgroundColor: colors.surfaceRaised,
    padding: spacing.lg,
  },
  modeDescription: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  modeImage: {
    height: '100%',
    width: '100%',
  },
  modeTitle: {
    ...typography.title,
    color: colors.text,
    flex: 1,
  },
  options: {
    gap: spacing.lg,
  },
  pageTitle: {
    ...typography.heading,
    color: colors.text,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
});

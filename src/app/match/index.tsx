import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { ScreenShell } from '@/components/ui/app-shell';
import {
  AppButton,
  AppPill,
  Reveal,
  SurfaceCard,
} from '@/components/ui/app-primitives';
import { colors, spacing, typography } from '@/theme/theme';

export default function MatchIndexScreen() {
  return (
    <ScreenShell contentContainerStyle={styles.content} tone="match">
      <Reveal>
        <SurfaceCard
          contentStyle={styles.heroCardContent}
          gradientColors={['#FF8E66', '#E12B2D', '#7A1018']}>
          <AppPill label="ModoMatch online" tone="cream" />

          <Image
            accessible={false}
            contentFit="contain"
            source={require('../../../assets/images/ComerOQue/mode-match-coming-soon-illustration.png')}
            style={styles.heroImage}
          />

          <Text accessibilityRole="header" style={styles.heroTitle}>
            Deu match, deu fome.
          </Text>
          <Text style={styles.heroSubtitle}>Convide alguém e escolham juntos.</Text>
        </SurfaceCard>
      </Reveal>

      <Reveal delay={90}>
        <SurfaceCard contentStyle={styles.actionsCard}>
          <Text style={styles.actionsTitle}>Como quer começar?</Text>
          <AppButton onPress={() => router.push('/match/create')} title="Criar sala" />
          <AppButton
            onPress={() => router.push('/match/join')}
            title="Entrar com código"
            variant="secondary"
          />
          <Text style={styles.actionsHint}>2 pessoas • sala válida por 2 horas</Text>
        </SurfaceCard>
      </Reveal>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  actionsCard: {
    gap: spacing.md,
  },
  actionsHint: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
  actionsTitle: {
    ...typography.heading,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  content: {
    gap: spacing.lg,
  },
  heroCardContent: {
    alignItems: 'center',
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  heroImage: {
    height: 300,
    marginTop: spacing.sm,
    width: '100%',
  },
  heroSubtitle: {
    ...typography.body,
    color: colors.textInverted,
    marginTop: spacing.sm,
    maxWidth: 540,
    textAlign: 'center',
  },
  heroTitle: {
    ...typography.title,
    color: colors.textInverted,
    marginTop: spacing.md,
    textAlign: 'center',
  },
});

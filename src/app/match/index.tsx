import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { ScreenShell } from '@/components/ui/app-shell';
import {
  AppButton,
  AppPill,
  Reveal,
  SectionHeading,
  SurfaceCard,
} from '@/components/ui/app-primitives';
import { colors, radius, shadows, spacing, typography } from '@/theme/theme';

const howItWorks = [
  {
    emoji: '🧑‍🍳',
    text: 'Cada pessoa entra com apelido temporário e sem login.',
  },
  {
    emoji: '💌',
    text: 'O convite funciona por código curto e por link compartilhável.',
  },
  {
    emoji: '👍',
    text: 'Quando os dois curtem a mesma comida, o match aparece na hora.',
  },
] as const;

const quickFacts = [
  'feito para 2 pessoas',
  'sala expira em 2 horas',
  'a rodada continua após o match',
] as const;

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
            Decidir em dupla agora tem presença de verdade.
          </Text>
          <Text style={styles.heroSubtitle}>
            Convide outra pessoa, votem nos cards e deixem a rodada seguir até pintar
            mais de um match.
          </Text>

          <View style={styles.quickFacts}>
            {quickFacts.map((fact) => (
              <AppPill
                key={fact}
                label={fact}
                style={styles.heroFact}
                textStyle={styles.heroFactText}
                tone="dark"
              />
            ))}
          </View>
        </SurfaceCard>
      </Reveal>

      <Reveal delay={90}>
        <SectionHeading
          eyebrow="Como funciona"
          title="Uma dinâmica simples, rápida e muito mais gostosa de usar."
        />
      </Reveal>

      <Reveal delay={140}>
        <SurfaceCard contentStyle={styles.stepsCardContent}>
          {howItWorks.map((step) => (
            <View key={step.text} style={styles.stepRow}>
              <View style={styles.stepEmojiBubble}>
                <Text style={styles.stepEmoji}>{step.emoji}</Text>
              </View>
              <Text style={styles.stepText}>{step.text}</Text>
            </View>
          ))}
        </SurfaceCard>
      </Reveal>

      <Reveal delay={210}>
        <SurfaceCard style={styles.noticeCard} tone="sun">
          <Text style={styles.noticeTitle}>Sala enxuta, experiência caprichada</Text>
          <Text style={styles.noticeText}>
            O v1 é focado em 2 pessoas, com filtro por categoria e começo manual pelo
            criador.
          </Text>
        </SurfaceCard>
      </Reveal>

      <Reveal delay={260} style={styles.actions}>
        <AppButton onPress={() => router.push('/match/create')} title="Criar sala" />
        <AppButton
          onPress={() => router.push('/match/join')}
          title="Entrar com código"
          variant="secondary"
        />
      </Reveal>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: spacing.md,
  },
  content: {
    gap: spacing.xl,
  },
  heroCardContent: {
    alignItems: 'center',
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  heroFact: {
    backgroundColor: 'rgba(49, 18, 23, 0.16)',
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  heroFactText: {
    color: colors.textInverted,
  },
  heroImage: {
    height: 260,
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
  noticeCard: {
    backgroundColor: colors.yellow,
  },
  noticeText: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  noticeTitle: {
    ...typography.subheading,
    color: colors.text,
  },
  quickFacts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  stepEmoji: {
    fontSize: 28,
  },
  stepEmojiBubble: {
    ...shadows.soft,
    alignItems: 'center',
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.cardBorderSoft,
    borderRadius: radius.lg,
    borderWidth: 1,
    height: 58,
    justifyContent: 'center',
    width: 58,
  },
  stepRow: {
    alignItems: 'center',
    backgroundColor: colors.surfaceWarm,
    borderColor: colors.cardBorderSoft,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
  },
  stepText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  stepsCardContent: {
    gap: spacing.md,
  },
});

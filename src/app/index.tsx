import { Image } from 'expo-image';
import { router, type Href } from 'expo-router';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';

import { ScreenShell } from '@/components/ui/app-shell';
import {
  AppPill,
  Reveal,
  SectionHeading,
  SurfaceCard,
} from '@/components/ui/app-primitives';
import { colors, radius, shadows, spacing, typography } from '@/theme/theme';

type HomeOption = {
  badge: string;
  description: string;
  emoji: string;
  helper: string;
  href: Href;
  title: string;
  tone: 'mint' | 'peach' | 'sun';
};

const homeOptions: HomeOption[] = [
  {
    badge: 'Rápido',
    title: 'Modo Entrevista',
    description: 'Perguntas curtas, leitura clara e uma recomendação com cara de resposta certeira.',
    helper: 'Ótimo para matar a indecisão em poucos toques.',
    emoji: '🎤',
    href: '/interview',
    tone: 'peach',
  },
  {
    badge: 'Surpresa',
    title: 'Roleta',
    description: 'A sorte ganha palco com suspense leve, visual mais apetitoso e resultado em destaque.',
    helper: 'Perfeito para quando você quer se deixar levar.',
    emoji: '🎡',
    href: '/roulette',
    tone: 'sun',
  },
  {
    badge: 'Em dupla',
    title: 'ModoMatch',
    description: 'Uma sala charmosa para duas pessoas curtirem os mesmos cards e celebrarem cada match.',
    helper: 'Feito para decidir junto sem conversa infinita.',
    emoji: '💞',
    href: '/match',
    tone: 'mint',
  },
];

const heroHighlights = [
  'vermelho desejo em destaque',
  'cards grandes e claros',
  'fluxos com mais energia',
] as const;

function getOptionAccentStyle(tone: HomeOption['tone']): ViewStyle {
  switch (tone) {
    case 'mint':
      return { backgroundColor: colors.mint };
    case 'peach':
      return { backgroundColor: colors.peach };
    case 'sun':
      return { backgroundColor: colors.yellow };
  }
}

export default function HomeScreen() {
  return (
    <ScreenShell
      contentContainerStyle={styles.content}
      edges={['top', 'bottom']}
      tone="home">
      <Reveal>
        <SurfaceCard
          contentStyle={styles.heroCardContent}
          gradientColors={['#FF8E66', '#E12B2D', '#87131B']}
          style={styles.heroCard}>
          <AppPill label="Seu app anti-indecisão" tone="cream" />

          <View
            accessible
            accessibilityLabel="Comer O Quê?"
            accessibilityRole="header"
            style={styles.logoWrapper}>
            <Image
              accessible={false}
              contentFit="contain"
              source={require('../../assets/images/ComerOQue/logo-horizontal-comer-o-que.png')}
              style={styles.logo}
            />
          </View>

          <Text style={styles.heroTitle}>A fome chegou. O app resolve com vontade.</Text>
          <Text style={styles.heroSubtitle}>
            O Comer O Quê? agora tem mais presença, mais calor e uma cara de app de comida
            que abre o apetite antes mesmo da escolha.
          </Text>

          <View style={styles.highlightRow}>
            {heroHighlights.map((item) => (
              <AppPill
                key={item}
                label={item}
                style={styles.highlightPill}
                textStyle={styles.highlightPillText}
                tone="dark"
              />
            ))}
          </View>

          <Image
            accessible={false}
            contentFit="contain"
            source={require('../../assets/images/ComerOQue/home-hero.png')}
            style={styles.heroImage}
          />
        </SurfaceCard>
      </Reveal>

      <Reveal delay={90}>
        <SectionHeading
          eyebrow="Modos principais"
          title="Escolha o clima da fome e deixe o app conduzir a experiência."
        />
      </Reveal>

      <View style={styles.options}>
        {homeOptions.map((option, index) => (
          <Reveal delay={150 + index * 70} key={option.title}>
            <Pressable
              accessibilityHint={option.description}
              accessibilityLabel={option.title}
              accessibilityRole="button"
              onPress={() => router.push(option.href)}
              style={({ pressed }) => [
                styles.cardPressable,
                pressed && styles.cardPressed,
              ]}>
              <SurfaceCard
                contentStyle={styles.optionCardContent}
                style={[styles.optionCard, getOptionAccentStyle(option.tone)]}
                tone={option.tone}>
                <View style={styles.cardTopRow}>
                  <View style={styles.cardEmojiBubble}>
                    <Text style={styles.cardEmoji}>{option.emoji}</Text>
                  </View>
                  <AppPill label={option.badge} tone="cream" />
                </View>

                <Text style={styles.cardTitle}>{option.title}</Text>
                <Text style={styles.cardDescription}>{option.description}</Text>

                <View style={styles.cardFooter}>
                  <Text style={styles.cardHelper}>{option.helper}</Text>
                  <View style={styles.arrowBadge}>
                    <Text style={styles.arrowText}>Abrir modo</Text>
                  </View>
                </View>
              </SurfaceCard>
            </Pressable>
          </Reveal>
        ))}
      </View>

      <Reveal delay={390}>
        <SectionHeading
          eyebrow="Sugestões"
          title="Tem uma ideia boa, um elogio ou um bug? A caixinha continua aberta."
        />
      </Reveal>

      <Reveal delay={430}>
        <Pressable
          accessibilityHint="Abre a área para enviar sugestão, elogio ou problema"
          accessibilityLabel="Abrir sugestões"
          accessibilityRole="button"
          onPress={() => router.push('/suggestions')}
          style={({ pressed }) => [styles.cardPressable, pressed && styles.cardPressed]}>
          <SurfaceCard
            contentStyle={styles.feedbackCardContent}
            gradientColors={['#FFF5F1', '#FFE5DA']}
            style={styles.feedbackCard}>
            <View style={styles.cardTopRow}>
              <View style={styles.cardEmojiBubble}>
                <Text style={styles.cardEmoji}>💌</Text>
              </View>
              <AppPill label="Fala com a gente" tone="red" />
            </View>

            <Text style={styles.cardTitle}>Abrir caixinha de sugestões</Text>
            <Text style={styles.cardDescription}>
              Envie seu nome e uma mensagem com sugestão, elogio ou relato de problema.
            </Text>

            <View style={styles.cardFooter}>
              <Text style={styles.cardHelper}>Seu recado vai direto para o Supabase.</Text>
              <View style={styles.arrowBadge}>
                <Text style={styles.arrowText}>Enviar mensagem</Text>
              </View>
            </View>
          </SurfaceCard>
        </Pressable>
      </Reveal>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  arrowBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.cardBorderSoft,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  arrowText: {
    ...typography.caption,
    color: colors.primaryDark,
    textTransform: 'uppercase',
  },
  cardDescription: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  cardEmoji: {
    fontSize: 38,
  },
  cardEmojiBubble: {
    ...shadows.soft,
    alignItems: 'center',
    backgroundColor: colors.surfaceTranslucent,
    borderColor: colors.cardBorderSoft,
    borderRadius: radius.lg,
    borderWidth: 1,
    height: 74,
    justifyContent: 'center',
    width: 74,
  },
  cardFooter: {
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  cardHelper: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  cardPressed: {
    opacity: 0.94,
    transform: [{ scale: 0.988 }],
  },
  cardPressable: {
    borderRadius: radius.xl,
  },
  cardTitle: {
    ...typography.heading,
    color: colors.text,
    marginTop: spacing.lg,
  },
  cardTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  content: {
    gap: spacing.xl,
  },
  feedbackCard: {
    minHeight: 210,
  },
  feedbackCardContent: {
    minHeight: 210,
  },
  heroCard: {
    ...shadows.floating,
  },
  heroCardContent: {
    alignItems: 'center',
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  heroImage: {
    aspectRatio: 1122 / 1402,
    marginTop: spacing.lg,
    maxWidth: 350,
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
    ...typography.hero,
    color: colors.textInverted,
    marginTop: spacing.md,
    maxWidth: 540,
    textAlign: 'center',
  },
  highlightPill: {
    backgroundColor: 'rgba(49, 18, 23, 0.16)',
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  highlightPillText: {
    color: colors.textInverted,
  },
  highlightRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  logo: {
    aspectRatio: 3,
    maxWidth: 420,
    width: '100%',
  },
  logoWrapper: {
    alignItems: 'center',
    marginTop: spacing.md,
    width: '100%',
  },
  optionCard: {
    minHeight: 230,
  },
  optionCardContent: {
    minHeight: 230,
  },
  options: {
    gap: spacing.md,
  },
});

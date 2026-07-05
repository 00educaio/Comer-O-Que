import { Image } from 'expo-image';
import { Link, type Href } from 'expo-router';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  type ViewStyle,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientBackground } from '@/components/ui/ambient-background';
import { colors, radius, shadows, spacing, typography } from '@/theme/theme';

type HomeOption = {
  description: string;
  emoji: string;
  helper: string;
  href: Href;
  title: string;
  tone: ViewStyle['backgroundColor'];
};

const homeOptions: HomeOption[] = [
  {
    title: 'Modo Entrevista',
    description: 'Perguntas rápidas, resposta certeira e zero drama na hora de escolher.',
    helper: 'Ideal para resolver sozinho em minutos.',
    emoji: '🎤',
    href: '/interview',
    tone: colors.pink,
  },
  {
    title: 'Roleta',
    description: 'A sorte entra em cena com suspense leve e um resultado irresistível.',
    helper: 'Perfeito para quem quer surpresa.',
    emoji: '🎡',
    href: '/roulette',
    tone: colors.yellow,
  },
  {
    title: 'ModoMatch',
    description: 'Uma rodada online para duas pessoas curtirem a mesma comida.',
    helper: 'Feito para decidir em dupla.',
    emoji: '💞',
    href: '/match',
    tone: colors.mint,
  },
];

const heroHighlights = ['3 jeitos de decidir', 'visual divertido', 'match online em dupla'];

export default function HomeScreen() {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <SafeAreaView style={styles.safeArea}>
        <AmbientBackground style={styles.ambient} tone="home">
          <View style={styles.heroCard}>
            <View style={styles.kicker}>
              <Text style={styles.kickerText}>Seu app anti-indecisão</Text>
            </View>

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

            <Text style={styles.heroTitle}>A fome chegou. O app resolve o resto.</Text>
            <Text style={styles.subtitle}>
              Um visual mais caprichado para transformar indecisão em vontade de comer
              agora.
            </Text>

            <View style={styles.highlightRow}>
              {heroHighlights.map((item) => (
                <View key={item} style={styles.highlightChip}>
                  <Text style={styles.highlightChipText}>{item}</Text>
                </View>
              ))}
            </View>

            <Image
              accessible={false}
              contentFit="contain"
              source={require('../../assets/images/ComerOQue/home-hero.png')}
              style={styles.heroImage}
            />
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionEyebrow}>Modos principais</Text>
            <Text style={styles.sectionTitle}>
              Cada tipo de fome agora tem uma vitrine com mais presença.
            </Text>
          </View>

          <View style={styles.options}>
            {homeOptions.map((option) => (
              <Link key={option.title} href={option.href} asChild>
                <Pressable
                  accessibilityHint={option.description}
                  accessibilityLabel={option.title}
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    styles.card,
                    { backgroundColor: option.tone },
                    pressed && styles.cardPressed,
                  ]}>
                  <View style={styles.cardTopRow}>
                    <View
                      accessibilityElementsHidden
                      importantForAccessibility="no-hide-descendants"
                      style={styles.cardEmojiBubble}>
                      <Text style={styles.cardEmoji}>{option.emoji}</Text>
                    </View>
                    <View style={styles.cardArrowBubble}>
                      <Text style={styles.arrow}>›</Text>
                    </View>
                  </View>

                  <Text style={styles.cardTitle}>{option.title}</Text>
                  <Text style={styles.cardDescription}>{option.description}</Text>

                  <View style={styles.cardFooter}>
                    <Text style={styles.cardHelper}>{option.helper}</Text>
                    <View style={styles.ctaPill}>
                      <Text style={styles.ctaPillText}>Abrir modo</Text>
                    </View>
                  </View>
                </Pressable>
              </Link>
            ))}
          </View>
        </AmbientBackground>
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  safeArea: {
    alignSelf: 'center',
    flex: 1,
    maxWidth: 720,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    width: '100%',
  },
  ambient: {
    borderRadius: radius.xl,
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  heroCard: {
    ...shadows.floating,
    alignItems: 'center',
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.cardBorder,
    borderRadius: radius.xl,
    borderWidth: 2,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  kicker: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryGlow,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  kickerText: {
    ...typography.label,
    color: colors.primaryDark,
    textTransform: 'uppercase',
  },
  logoWrapper: {
    alignItems: 'center',
    marginTop: spacing.md,
    width: '100%',
  },
  logo: {
    aspectRatio: 3,
    maxWidth: 420,
    width: '100%',
  },
  heroTitle: {
    ...typography.hero,
    color: colors.text,
    marginTop: spacing.md,
    maxWidth: 520,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.sm,
    maxWidth: 500,
    textAlign: 'center',
  },
  highlightRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  highlightChip: {
    backgroundColor: colors.surfaceWarm,
    borderColor: colors.cardBorderSoft,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  highlightChipText: {
    ...typography.caption,
    color: colors.text,
  },
  heroImage: {
    aspectRatio: 1122 / 1402,
    marginTop: spacing.lg,
    maxWidth: 350,
    width: '100%',
  },
  sectionHeader: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xs,
  },
  sectionEyebrow: {
    ...typography.label,
    color: colors.primaryDark,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    ...typography.subheading,
    color: colors.text,
    marginTop: spacing.sm,
  },
  options: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  card: {
    ...shadows.card,
    borderColor: colors.cardBorder,
    borderRadius: radius.lg,
    borderWidth: 2,
    minHeight: 214,
    padding: spacing.lg,
  },
  cardPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
  cardTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardEmojiBubble: {
    ...shadows.soft,
    alignItems: 'center',
    backgroundColor: colors.surfaceTranslucent,
    borderColor: colors.cardBorderSoft,
    borderRadius: radius.md,
    borderWidth: 1,
    height: 72,
    justifyContent: 'center',
    width: 72,
  },
  cardEmoji: {
    fontSize: 38,
  },
  cardArrowBubble: {
    alignItems: 'center',
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.cardBorderSoft,
    borderRadius: radius.pill,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  arrow: {
    color: colors.primary,
    fontSize: 28,
    fontWeight: '900',
    marginTop: -1,
  },
  cardTitle: {
    ...typography.heading,
    color: colors.text,
    marginTop: spacing.lg,
  },
  cardDescription: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  cardFooter: {
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  cardHelper: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  ctaPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.cardBorderSoft,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  ctaPillText: {
    ...typography.caption,
    color: colors.primaryDark,
    textTransform: 'uppercase',
  },
});

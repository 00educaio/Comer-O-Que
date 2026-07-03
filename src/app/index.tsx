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

import { colors, radius, shadows, spacing, typography } from '@/theme/theme';

type HomeOption = {
  description: string;
  emoji: string;
  href: Href;
  isComingSoon?: boolean;
  title: string;
  tone: ViewStyle['backgroundColor'];
};

const homeOptions: HomeOption[] = [
  {
    title: 'Modo Entrevista',
    description: 'Responda rapidinho e receba um bom palpite.',
    emoji: '🎤',
    href: '/interview',
    tone: colors.pink,
  },
  {
    title: 'Roleta',
    description: 'Deixe a sorte escolher o prato de hoje.',
    emoji: '🎡',
    href: '/roulette',
    tone: colors.yellow,
  },
  {
    title: 'ModoMatch',
    description: 'Escolham juntos, sem duelo de “tanto faz”.',
    emoji: '💞',
    href: '/match-coming-soon',
    isComingSoon: true,
    tone: colors.mint,
  },
];

export default function HomeScreen() {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.hero}>
          <View
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={styles.logoBubble}>
            <Text style={styles.logoEmoji}>🍽️</Text>
          </View>
          <Text accessibilityRole="header" style={styles.title}>
            Comer O Quê?
          </Text>
          <Text style={styles.subtitle}>
            A fome chegou e a ideia não? Escolha um jeito de desempatar.
          </Text>
        </View>

        <View style={styles.options}>
          {homeOptions.map((option) => (
            <Link key={option.title} href={option.href} asChild>
              <Pressable
                accessibilityHint={option.description}
                accessibilityLabel={`${option.title}${option.isComingSoon ? ', em breve' : ''}`}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.card,
                  { backgroundColor: option.tone },
                  pressed && styles.cardPressed,
                ]}>
                <View
                  accessibilityElementsHidden
                  importantForAccessibility="no-hide-descendants"
                  style={styles.cardEmojiBubble}>
                  <Text style={styles.cardEmoji}>{option.emoji}</Text>
                </View>
                <View style={styles.cardCopy}>
                  <View style={styles.cardTitleRow}>
                    <Text style={styles.cardTitle}>{option.title}</Text>
                    {option.isComingSoon && <Text style={styles.badge}>EM BREVE</Text>}
                  </View>
                  <Text style={styles.cardDescription}>{option.description}</Text>
                </View>
                <Text style={styles.arrow}>›</Text>
              </Pressable>
            </Link>
          ))}
        </View>
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
  hero: {
    alignItems: 'center',
    paddingBottom: spacing.xl,
    paddingTop: spacing.xl,
  },
  logoBubble: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    borderRadius: radius.pill,
    borderWidth: 3,
    height: 88,
    justifyContent: 'center',
    marginBottom: spacing.md,
    transform: [{ rotate: '-4deg' }],
    width: 88,
  },
  logoEmoji: {
    fontSize: 48,
  },
  title: {
    ...typography.title,
    color: colors.primary,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.sm,
    maxWidth: 430,
    textAlign: 'center',
  },
  options: {
    gap: spacing.md,
  },
  card: {
    alignItems: 'center',
    borderColor: colors.cardBorder,
    borderRadius: radius.lg,
    borderWidth: 2,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 132,
    padding: spacing.lg,
    ...shadows.card,
  },
  cardPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
  cardEmojiBubble: {
    alignItems: 'center',
    backgroundColor: colors.surfaceTranslucent,
    borderRadius: radius.md,
    height: 68,
    justifyContent: 'center',
    width: 68,
  },
  cardEmoji: {
    fontSize: 38,
  },
  cardCopy: {
    flex: 1,
  },
  cardTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  cardTitle: {
    ...typography.heading,
    color: colors.text,
  },
  badge: {
    ...typography.caption,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    color: colors.onPrimary,
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  cardDescription: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  arrow: {
    color: colors.primary,
    fontSize: 40,
    fontWeight: '900',
  },
});

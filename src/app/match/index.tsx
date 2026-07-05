import { Image } from 'expo-image';
import { Link } from 'expo-router';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, shadows, spacing, typography } from '@/theme/theme';

const howItWorks = [
  { emoji: '🧑‍🍳', text: 'Cada pessoa entra com um apelido temporário.' },
  { emoji: '💌', text: 'Compartilhe o código da sala ou o convite por link.' },
  { emoji: '👍', text: 'Quando os dois curtirem a mesma comida, deu match.' },
] as const;

export default function MatchIndexScreen() {
  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      style={styles.screen}>
      <SafeAreaView edges={['bottom']} style={styles.safeArea}>
        <Image
          accessible={false}
          contentFit="cover"
          source={require('../../../assets/images/ComerOQue/mode-match-coming-soon-illustration.png')}
          style={styles.heroImage}
        />

        <Text accessibilityRole="header" style={styles.title}>
          ModoMatch
        </Text>
        <Text style={styles.subtitle}>
          Escolha comida junto com outra pessoa. Cada um vota nos cards e o prato
          só vence quando os dois disserem “Gostei”.
        </Text>

        <View style={styles.stepsCard}>
          {howItWorks.map((step) => (
            <View key={step.text} style={styles.stepRow}>
              <View style={styles.stepEmojiBubble}>
                <Text style={styles.stepEmoji}>{step.emoji}</Text>
              </View>
              <Text style={styles.stepText}>{step.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>V1 feita para 2 pessoas</Text>
          <Text style={styles.noticeText}>
            Sem login, com apelido temporário e sala online pelo Supabase.
          </Text>
        </View>

        <View style={styles.actions}>
          <Link href="/match/create" asChild>
            <Pressable
              accessibilityHint="Abre a criação de uma nova sala"
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.buttonPressed,
              ]}>
              <Text style={styles.primaryButtonText}>Criar sala</Text>
            </Pressable>
          </Link>

          <Link href="/match/join" asChild>
            <Pressable
              accessibilityHint="Abre a tela para entrar com um código"
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.buttonPressed,
              ]}>
              <Text style={styles.secondaryButtonText}>Entrar com código</Text>
            </Pressable>
          </Link>
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
  scrollContent: {
    flexGrow: 1,
  },
  safeArea: {
    alignItems: 'center',
    alignSelf: 'center',
    flex: 1,
    maxWidth: 720,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    width: '100%',
  },
  heroImage: {
    borderColor: colors.cardBorder,
    borderRadius: radius.lg,
    borderWidth: 2,
    height: 280,
    marginTop: spacing.md,
    width: '100%',
    ...shadows.card,
  },
  title: {
    ...typography.title,
    color: colors.primary,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.sm,
    maxWidth: 520,
    textAlign: 'center',
  },
  stepsCard: {
    ...shadows.card,
    backgroundColor: colors.surface,
    borderColor: colors.cardBorder,
    borderRadius: radius.lg,
    borderWidth: 2,
    gap: spacing.md,
    marginTop: spacing.lg,
    padding: spacing.lg,
    width: '100%',
  },
  stepRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  stepEmojiBubble: {
    alignItems: 'center',
    backgroundColor: colors.mint,
    borderRadius: radius.md,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  stepEmoji: {
    fontSize: 28,
  },
  stepText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  noticeCard: {
    backgroundColor: colors.yellow,
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
    borderWidth: 2,
    marginTop: spacing.lg,
    padding: spacing.lg,
    width: '100%',
  },
  noticeTitle: {
    ...typography.heading,
    color: colors.text,
  },
  noticeText: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  actions: {
    gap: spacing.md,
    marginTop: spacing.xl,
    width: '100%',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    justifyContent: 'center',
    minHeight: 58,
    paddingHorizontal: spacing.xl,
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.cardBorder,
    borderRadius: radius.pill,
    borderWidth: 2,
    justifyContent: 'center',
    minHeight: 58,
    paddingHorizontal: spacing.xl,
  },
  buttonPressed: {
    opacity: 0.84,
    transform: [{ scale: 0.98 }],
  },
  primaryButtonText: {
    ...typography.button,
    color: colors.onPrimary,
  },
  secondaryButtonText: {
    ...typography.button,
    color: colors.text,
  },
});

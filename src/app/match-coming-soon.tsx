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

const matchSteps = [
  { emoji: '👥', label: 'A galera entra' },
  { emoji: '👍', label: 'Todo mundo escolhe' },
  { emoji: '💞', label: 'O prato dá match' },
] as const;

export default function MatchComingSoonScreen() {
  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      style={styles.screen}>
      <SafeAreaView edges={['bottom']} style={styles.safeArea}>
        <Image
          accessible={false}
          contentFit="cover"
          source={require('../../assets/images/ComerOQue/mode-match-coming-soon-illustration.png')}
          style={styles.modeIllustration}
        />

        <Text accessibilityRole="header" style={styles.title}>
          ModoMatch em breve!
        </Text>
        <Text style={styles.description}>
          Escolha comida junto com seu par ou com a galera. Todo mundo dá like
          ou dislike nas opções, e quando todos curtirem o mesmo prato… deu match!
        </Text>

        <View accessibilityLabel="Como o ModoMatch vai funcionar" style={styles.stepsCard}>
          {matchSteps.map((step, index) => (
            <View key={step.label} style={styles.stepRow}>
              <View style={styles.step}>
                <View style={styles.stepEmojiBubble}>
                  <Text style={styles.stepEmoji}>{step.emoji}</Text>
                </View>
                <Text style={styles.stepLabel}>{step.label}</Text>
              </View>
              {index < matchSteps.length - 1 && (
                <Text accessibilityElementsHidden style={styles.arrow}>
                  ↓
                </Text>
              )}
            </View>
          ))}
        </View>

        <View style={styles.notice}>
          <Text style={styles.noticeEmoji}>🔥</Text>
          <Text style={styles.noticeText}>
            Essa funcionalidade ainda está no forno.
          </Text>
        </View>

        <Link href="/" dismissTo asChild>
          <Pressable
            accessibilityHint="Retorna para a tela inicial"
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}>
            <Text style={styles.buttonText}>Voltar para a Home</Text>
          </Pressable>
        </Link>
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
    justifyContent: 'center',
    maxWidth: 620,
    padding: spacing.lg,
    width: '100%',
  },
  modeIllustration: {
    borderColor: colors.cardBorder,
    borderRadius: radius.lg,
    borderWidth: 2,
    height: 300,
    width: '100%',
    ...shadows.card,
  },
  title: {
    ...typography.title,
    color: colors.primary,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  description: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.md,
    maxWidth: 520,
    textAlign: 'center',
  },
  stepsCard: {
    ...shadows.card,
    backgroundColor: colors.mint,
    borderColor: colors.cardBorder,
    borderRadius: radius.lg,
    borderWidth: 2,
    marginTop: spacing.lg,
    padding: spacing.lg,
    width: '100%',
  },
  stepRow: {
    alignItems: 'center',
  },
  step: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  stepEmojiBubble: {
    alignItems: 'center',
    backgroundColor: colors.surfaceTranslucent,
    borderRadius: radius.md,
    height: 54,
    justifyContent: 'center',
    width: 54,
  },
  stepEmoji: {
    fontSize: 30,
  },
  stepLabel: {
    ...typography.button,
    color: colors.text,
    flex: 1,
  },
  arrow: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: '900',
    marginVertical: spacing.xs,
  },
  notice: {
    alignItems: 'center',
    backgroundColor: colors.yellow,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  noticeEmoji: {
    fontSize: 25,
  },
  noticeText: {
    ...typography.button,
    color: colors.text,
    flexShrink: 1,
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    justifyContent: 'center',
    marginTop: spacing.lg,
    minHeight: 56,
    paddingHorizontal: spacing.xl,
    width: '100%',
  },
  buttonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    ...typography.button,
    color: colors.onPrimary,
    textAlign: 'center',
  },
});

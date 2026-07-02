import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing, typography } from '@/theme/theme';

export default function MatchComingSoonScreen() {
  return (
    <SafeAreaView edges={['bottom']} style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.emoji}>💞</Text>
        <Text style={styles.title}>ModoMatch em breve!</Text>
        <Text style={styles.description}>
          A ideia está no forno: todo mundo escolhe, e o prato favorito da galera dá match.
        </Text>

        <Link href="/" dismissTo asChild>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
            <Text style={styles.buttonText}>Voltar para o início</Text>
          </Pressable>
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    alignItems: 'center',
    backgroundColor: colors.mint,
    borderColor: colors.cardBorder,
    borderRadius: radius.lg,
    borderWidth: 2,
    maxWidth: 520,
    padding: spacing.xl,
  },
  emoji: {
    fontSize: 64,
  },
  title: {
    ...typography.heading,
    color: colors.text,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  description: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  buttonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    ...typography.button,
    color: colors.onPrimary,
  },
});

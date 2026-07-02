import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing, typography } from '@/theme/theme';

export default function InterviewScreen() {
  return (
    <SafeAreaView edges={['bottom']} style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.emoji}>🎤</Text>
        <Text style={styles.title}>Preparando as perguntas</Text>
        <Text style={styles.description}>
          Logo você vai responder uma entrevista curtinha e receber sugestões com a sua cara.
        </Text>
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
    backgroundColor: colors.pink,
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
});

import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing, typography } from '@/theme/theme';

export default function RouletteScreen() {
  return (
    <SafeAreaView edges={['bottom']} style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.emoji}>🎡</Text>
        <Text style={styles.title}>A roleta está esquentando</Text>
        <Text style={styles.description}>
          Em breve, quatro roletas vão ajudar a sorte a decidir seu próximo prato.
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
    backgroundColor: colors.yellow,
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

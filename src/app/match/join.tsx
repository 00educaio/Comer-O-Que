import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { joinMatchRoom, normalizeMatchRoomCode } from '@/services/matchService';
import { colors, radius, shadows, spacing, typography } from '@/theme/theme';

export default function MatchJoinScreen() {
  const params = useLocalSearchParams<{ code?: string }>();
  const initialCode = normalizeMatchRoomCode(params.code ?? '');
  const [nickname, setNickname] = useState('');
  const [code, setCode] = useState(initialCode);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleJoinRoom() {
    if (isSubmitting) {
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const result = await joinMatchRoom({
        code,
        nickname,
      });

      router.replace(`/match/${result.code}`);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Não conseguimos entrar nessa sala agora. Tente novamente.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      style={styles.screen}>
      <SafeAreaView edges={['bottom']} style={styles.safeArea}>
        <Text accessibilityRole="header" style={styles.title}>
          Entrar com código
        </Text>
        <Text style={styles.subtitle}>
          Digite seu apelido e o código da sala para cair direto no lobby.
        </Text>

        <View style={styles.formCard}>
          <Text style={styles.fieldLabel}>Seu apelido</Text>
          <TextInput
            autoCapitalize="words"
            autoCorrect={false}
            maxLength={32}
            onChangeText={setNickname}
            placeholder="Ex.: Duo da fome"
            placeholderTextColor={colors.textMuted}
            returnKeyType="next"
            style={styles.input}
            value={nickname}
          />

          <Text style={[styles.fieldLabel, styles.codeLabel]}>Código da sala</Text>
          <TextInput
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={6}
            onChangeText={(value) => setCode(normalizeMatchRoomCode(value))}
            placeholder="ABC123"
            placeholderTextColor={colors.textMuted}
            returnKeyType="done"
            style={[styles.input, styles.codeInput]}
            value={code}
          />

          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>Dica rápida</Text>
            <Text style={styles.tipText}>
              O código sempre fica em maiúsculas e a sala expira após 2 horas.
            </Text>
          </View>

          {errorMessage && (
            <Text accessibilityLiveRegion="polite" style={styles.errorText}>
              {errorMessage}
            </Text>
          )}

          <Pressable
            accessibilityRole="button"
            disabled={isSubmitting}
            onPress={() => void handleJoinRoom()}
            style={({ pressed }) => [
              styles.primaryButton,
              isSubmitting && styles.buttonDisabled,
              pressed && styles.buttonPressed,
            ]}>
            <Text style={styles.primaryButtonText}>
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </Text>
          </Pressable>
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
    alignSelf: 'center',
    flex: 1,
    maxWidth: 720,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    width: '100%',
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
    textAlign: 'center',
  },
  formCard: {
    ...shadows.card,
    backgroundColor: colors.surface,
    borderColor: colors.cardBorder,
    borderRadius: radius.lg,
    borderWidth: 2,
    marginTop: spacing.xl,
    padding: spacing.lg,
  },
  fieldLabel: {
    ...typography.button,
    color: colors.text,
  },
  codeLabel: {
    marginTop: spacing.lg,
  },
  input: {
    ...typography.body,
    backgroundColor: colors.background,
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
    borderWidth: 2,
    color: colors.text,
    marginTop: spacing.sm,
    minHeight: 54,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  codeInput: {
    letterSpacing: 2.4,
    textTransform: 'uppercase',
  },
  tipCard: {
    backgroundColor: colors.yellow,
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
    borderWidth: 2,
    marginTop: spacing.lg,
    padding: spacing.md,
  },
  tipTitle: {
    ...typography.button,
    color: colors.text,
  },
  tipText: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  errorText: {
    ...typography.body,
    color: colors.primaryDark,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    justifyContent: 'center',
    marginTop: spacing.xl,
    minHeight: 58,
    paddingHorizontal: spacing.xl,
  },
  primaryButtonText: {
    ...typography.button,
    color: colors.onPrimary,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonPressed: {
    opacity: 0.84,
    transform: [{ scale: 0.98 }],
  },
});

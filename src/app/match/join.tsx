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

import { AmbientBackground } from '@/components/ui/ambient-background';
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
        <AmbientBackground style={styles.ambient} tone="match">
          <View style={styles.heroCard}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>Entrando na sala</Text>
            </View>
            <Text accessibilityRole="header" style={styles.title}>
              Digite o código e caia direto no lobby.
            </Text>
            <Text style={styles.subtitle}>
              O fluxo foi polido para ficar simples, rápido e claro mesmo em tela
              pequena.
            </Text>
          </View>

          <View style={styles.formCard}>
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Seu apelido</Text>
              <Text style={styles.fieldHint}>Ele aparece para a outra pessoa assim que você entrar.</Text>
              <TextInput
                autoCapitalize="words"
                autoCorrect={false}
                maxLength={32}
                onChangeText={setNickname}
                placeholder="Ex.: Duo da fome"
                placeholderTextColor={colors.textSoft}
                returnKeyType="next"
                style={styles.input}
                value={nickname}
              />
            </View>

            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Código da sala</Text>
              <Text style={styles.fieldHint}>Sempre em maiúsculas, curto e fácil de compartilhar.</Text>
              <TextInput
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={6}
                onChangeText={(value) => setCode(normalizeMatchRoomCode(value))}
                placeholder="ABC123"
                placeholderTextColor={colors.textSoft}
                returnKeyType="done"
                style={[styles.input, styles.codeInput]}
                value={code}
              />
            </View>

            <View style={styles.tipCard}>
              <Text style={styles.tipTitle}>Dica rápida</Text>
              <Text style={styles.tipText}>
                Se o convite abrir pelo link, o código já chega preenchido para você.
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
  ambient: {
    borderRadius: radius.xl,
    paddingBottom: spacing.xl,
  },
  heroCard: {
    ...shadows.card,
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.cardBorder,
    borderRadius: radius.xl,
    borderWidth: 2,
    padding: spacing.lg,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryGlow,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  heroBadgeText: {
    ...typography.label,
    color: colors.primaryDark,
    textTransform: 'uppercase',
  },
  title: {
    ...typography.title,
    color: colors.text,
    marginTop: spacing.md,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  formCard: {
    ...shadows.floating,
    backgroundColor: colors.surface,
    borderColor: colors.cardBorder,
    borderRadius: radius.xl,
    borderWidth: 2,
    marginTop: spacing.xl,
    padding: spacing.lg,
  },
  fieldBlock: {
    gap: spacing.sm,
  },
  fieldLabel: {
    ...typography.subheading,
    color: colors.text,
  },
  fieldHint: {
    ...typography.body,
    color: colors.textMuted,
  },
  input: {
    ...typography.bodyStrong,
    backgroundColor: colors.surfaceWarm,
    borderColor: colors.cardBorderSoft,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.text,
    minHeight: 60,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  codeInput: {
    ...typography.code,
    backgroundColor: colors.primaryGlow,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  tipCard: {
    ...shadows.soft,
    backgroundColor: colors.yellow,
    borderColor: colors.cardBorder,
    borderRadius: radius.lg,
    borderWidth: 2,
    marginTop: spacing.xl,
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
    ...shadows.soft,
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    justifyContent: 'center',
    marginTop: spacing.xl,
    minHeight: 62,
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
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
});

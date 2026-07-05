import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { ScreenShell } from '@/components/ui/app-shell';
import {
  AppButton,
  AppPill,
  FormField,
  Reveal,
  SurfaceCard,
} from '@/components/ui/app-primitives';
import { joinMatchRoom, normalizeMatchRoomCode } from '@/services/matchService';
import { colors, spacing, typography } from '@/theme/theme';

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
    <ScreenShell
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      tone="match">
      <Reveal>
        <SurfaceCard
          contentStyle={styles.heroCardContent}
          gradientColors={['#FFA87C', '#E12B2D', '#89131D']}>
          <AppPill label="Entrando na sala" tone="cream" />
          <Text accessibilityRole="header" style={styles.heroTitle}>
            Digite o código e caia direto no lobby.
          </Text>
          <Text style={styles.heroSubtitle}>
            O fluxo agora está mais quente, mais claro e continua simples mesmo em
            tela pequena.
          </Text>
        </SurfaceCard>
      </Reveal>

      <Reveal delay={90}>
        <SurfaceCard contentStyle={styles.formCardContent}>
          <FormField
            autoCapitalize="words"
            autoCorrect={false}
            hint="Ele aparece para a outra pessoa assim que você entrar."
            label="Seu apelido"
            maxLength={32}
            onChangeText={setNickname}
            placeholder="Ex.: Duo da fome"
            returnKeyType="next"
            value={nickname}
          />

          <FormField
            autoCapitalize="characters"
            autoCorrect={false}
            hint="Sempre em maiúsculas, curto e fácil de compartilhar."
            label="Código da sala"
            maxLength={6}
            onChangeText={(value) => setCode(normalizeMatchRoomCode(value))}
            placeholder="ABC123"
            returnKeyType="done"
            value={code}
            variant="code"
          />

          <SurfaceCard style={styles.tipCard} tone="sun">
            <Text style={styles.tipTitle}>Dica rápida</Text>
            <Text style={styles.tipText}>
              Se o convite abrir pelo link, o código já chega preenchido para você.
            </Text>
          </SurfaceCard>

          {errorMessage ? (
            <Text accessibilityLiveRegion="polite" style={styles.errorText}>
              {errorMessage}
            </Text>
          ) : null}

          <AppButton
            disabled={isSubmitting}
            onPress={() => void handleJoinRoom()}
            style={styles.submitButton}
            title={isSubmitting ? 'Entrando...' : 'Entrar'}
          />
        </SurfaceCard>
      </Reveal>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.xl,
  },
  errorText: {
    ...typography.body,
    color: colors.primaryDark,
    textAlign: 'center',
  },
  formCardContent: {
    gap: spacing.lg,
  },
  heroCardContent: {
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  heroSubtitle: {
    ...typography.body,
    color: colors.textInverted,
    marginTop: spacing.sm,
  },
  heroTitle: {
    ...typography.title,
    color: colors.textInverted,
    marginTop: spacing.md,
  },
  submitButton: {
    marginTop: spacing.sm,
  },
  tipCard: {
    backgroundColor: colors.yellow,
  },
  tipText: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  tipTitle: {
    ...typography.button,
    color: colors.text,
  },
});

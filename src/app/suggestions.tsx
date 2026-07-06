import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ScreenShell } from '@/components/ui/app-shell';
import {
  AppButton,
  AppPill,
  FormField,
  Reveal,
  SurfaceCard,
} from '@/components/ui/app-primitives';
import { submitAppFeedback } from '@/services/feedbackService';
import { colors, spacing, typography } from '@/theme/theme';

export default function SuggestionsScreen() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (isSubmitting) {
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      await submitAppFeedback({ message, name });
      setMessage('');
      setSuccessMessage('Valeu! Sua mensagem foi salva para ajudar a melhorar o app.');
    } catch (error) {
      const friendlyMessage =
        error instanceof Error
          ? error.message
          : 'Não conseguimos salvar sua mensagem agora. Tente novamente.';
      setErrorMessage(friendlyMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ScreenShell
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      tone="home">
      <Reveal>
        <SurfaceCard
          contentStyle={styles.heroCardContent}
          gradientColors={['#FF9F79', '#E12B2D', '#8B1820']}>
          <AppPill label="Caixinha aberta" tone="cream" />
          <Text style={styles.heroEmoji}>💌</Text>
          <Text accessibilityRole="header" style={styles.heroTitle}>
            Manda sua ideia.
          </Text>
          <Text style={styles.heroSubtitle}>Sugestão, elogio ou problema.</Text>
        </SurfaceCard>
      </Reveal>

      <Reveal delay={90}>
        <SurfaceCard contentStyle={styles.formCardContent}>
          <FormField
            autoCapitalize="words"
            autoCorrect={false}
            label="Seu nome"
            maxLength={80}
            onChangeText={(value) => {
              setName(value);
              if (errorMessage) {
                setErrorMessage(null);
              }
            }}
            placeholder="Ex.: Caio"
            returnKeyType="next"
            value={name}
          />

          <FormField
            autoCapitalize="sentences"
            autoCorrect
            fieldStyle={styles.messageField}
            label="Sua mensagem"
            maxLength={1200}
            multiline
            onChangeText={(value) => {
              setMessage(value);
              if (errorMessage) {
                setErrorMessage(null);
              }
              if (successMessage) {
                setSuccessMessage(null);
              }
            }}
            placeholder="Escreva sua mensagem..."
            rightLabel={`${message.length}/1200`}
            value={message}
          />

          {errorMessage ? (
            <Text accessibilityLiveRegion="polite" style={styles.errorText}>
              {errorMessage}
            </Text>
          ) : null}

          {successMessage ? (
            <View accessibilityLiveRegion="polite">
              <SurfaceCard style={styles.successCard} tone="mint">
                <Text style={styles.successTitle}>Mensagem recebida</Text>
                <Text style={styles.successText}>{successMessage}</Text>
              </SurfaceCard>
            </View>
          ) : null}

          <AppButton
            disabled={isSubmitting}
            onPress={() => void handleSubmit()}
            style={styles.submitButton}
            title={isSubmitting ? 'Enviando mensagem...' : 'Enviar mensagem'}
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
    marginTop: spacing.md,
    textAlign: 'center',
  },
  formCardContent: {
    gap: spacing.lg,
  },
  heroCardContent: {
    alignItems: 'center',
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  heroEmoji: {
    fontSize: 52,
    marginTop: spacing.md,
  },
  heroSubtitle: {
    ...typography.body,
    color: colors.textInverted,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  heroTag: {
    backgroundColor: 'rgba(49, 18, 23, 0.16)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  heroTagText: {
    color: colors.textInverted,
  },
  heroTitle: {
    ...typography.title,
    color: colors.textInverted,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  messageField: {
    marginTop: spacing.xs,
  },
  noteCard: {
    backgroundColor: colors.surfaceTinted,
  },
  noteText: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  noteTitle: {
    ...typography.button,
    color: colors.text,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  submitButton: {
    marginTop: spacing.sm,
  },
  successCard: {
    backgroundColor: colors.mint,
  },
  successText: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  successTitle: {
    ...typography.button,
    color: colors.text,
  },
});

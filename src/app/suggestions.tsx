import { useState } from 'react';
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
import { submitAppFeedback } from '@/services/feedbackService';
import { colors, radius, shadows, spacing, typography } from '@/theme/theme';

const suggestionPills = ['Sugestão', 'Problema', 'Elogio'] as const;

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
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      style={styles.screen}>
      <SafeAreaView edges={['bottom']} style={styles.safeArea}>
        <AmbientBackground style={styles.ambient} tone="home">
          <View style={styles.heroCard}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>Caixinha aberta</Text>
            </View>
            <Text style={styles.heroEmoji}>💌</Text>
            <Text accessibilityRole="header" style={styles.title}>
              Conte o que você quer ver no app.
            </Text>
            <Text style={styles.subtitle}>
              Vale sugestão, elogio ou relato de problema. A gente salva seu nome e a
              mensagem para ler depois no Supabase.
            </Text>
            <View style={styles.pillRow}>
              {suggestionPills.map((pill) => (
                <View key={pill} style={styles.pill}>
                  <Text style={styles.pillText}>{pill}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.formCard}>
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Seu nome</Text>
              <Text style={styles.fieldHint}>
                É com ele que sua mensagem vai ficar registrada.
              </Text>
              <TextInput
                autoCapitalize="words"
                autoCorrect={false}
                maxLength={80}
                onChangeText={(value) => {
                  setName(value);
                  if (errorMessage) {
                    setErrorMessage(null);
                  }
                }}
                placeholder="Ex.: Caio"
                placeholderTextColor={colors.textSoft}
                returnKeyType="next"
                style={styles.input}
                value={name}
              />
            </View>

            <View style={[styles.fieldBlock, styles.messageFieldBlock]}>
              <View style={styles.fieldLabelRow}>
                <Text style={styles.fieldLabel}>Sua mensagem</Text>
                <Text style={styles.counterText}>{message.length}/1200</Text>
              </View>
              <Text style={styles.fieldHint}>
                Pode mandar uma sugestão, contar um bug ou deixar um elogio.
              </Text>
              <TextInput
                autoCapitalize="sentences"
                autoCorrect
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
                placeholder="Ex.: Seria legal salvar meu último resultado, ou então a tela X está travando..."
                placeholderTextColor={colors.textSoft}
                style={[styles.input, styles.messageInput]}
                textAlignVertical="top"
                value={message}
              />
            </View>

            <View style={styles.noteCard}>
              <Text style={styles.noteTitle}>O que fica salvo</Text>
              <Text style={styles.noteText}>Apenas seu nome e a mensagem enviada.</Text>
            </View>

            {errorMessage && (
              <Text accessibilityLiveRegion="polite" style={styles.errorText}>
                {errorMessage}
              </Text>
            )}

            {successMessage && (
              <View accessibilityLiveRegion="polite" style={styles.successCard}>
                <Text style={styles.successTitle}>Mensagem recebida</Text>
                <Text style={styles.successText}>{successMessage}</Text>
              </View>
            )}

            <Pressable
              accessibilityRole="button"
              disabled={isSubmitting}
              onPress={() => void handleSubmit()}
              style={({ pressed }) => [
                styles.primaryButton,
                isSubmitting && styles.buttonDisabled,
                pressed && styles.buttonPressed,
              ]}>
              <Text style={styles.primaryButtonText}>
                {isSubmitting ? 'Enviando mensagem...' : 'Enviar mensagem'}
              </Text>
            </Pressable>
          </View>
        </AmbientBackground>
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  ambient: {
    borderRadius: radius.xl,
    paddingBottom: spacing.xl,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
  counterText: {
    ...typography.caption,
    color: colors.textSoft,
  },
  errorText: {
    ...typography.body,
    color: colors.primaryDark,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  fieldBlock: {
    gap: spacing.sm,
  },
  fieldHint: {
    ...typography.body,
    color: colors.textMuted,
  },
  fieldLabel: {
    ...typography.subheading,
    color: colors.text,
  },
  fieldLabelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  heroCard: {
    ...shadows.card,
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.cardBorder,
    borderRadius: radius.xl,
    borderWidth: 2,
    padding: spacing.lg,
  },
  heroEmoji: {
    fontSize: 48,
    marginTop: spacing.md,
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
  messageFieldBlock: {
    marginTop: spacing.xl,
  },
  messageInput: {
    minHeight: 180,
    paddingTop: spacing.md,
  },
  noteCard: {
    ...shadows.soft,
    backgroundColor: colors.primaryGlow,
    borderColor: colors.cardBorderSoft,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginTop: spacing.xl,
    padding: spacing.md,
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
  pill: {
    backgroundColor: colors.surfaceWarm,
    borderColor: colors.cardBorderSoft,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  pillText: {
    ...typography.caption,
    color: colors.primaryDark,
    textTransform: 'uppercase',
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
  safeArea: {
    alignSelf: 'center',
    flex: 1,
    maxWidth: 720,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    width: '100%',
  },
  screen: {
    backgroundColor: colors.background,
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  successCard: {
    ...shadows.soft,
    backgroundColor: colors.mint,
    borderColor: colors.success,
    borderRadius: radius.lg,
    borderWidth: 2,
    marginTop: spacing.xl,
    padding: spacing.md,
  },
  successText: {
    ...typography.body,
    color: colors.text,
    marginTop: spacing.xs,
  },
  successTitle: {
    ...typography.button,
    color: colors.text,
  },
  title: {
    ...typography.title,
    color: colors.text,
    marginTop: spacing.sm,
  },
});

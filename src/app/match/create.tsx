import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { createMatchRoom } from '@/services/matchService';
import { colors, radius, shadows, spacing, typography } from '@/theme/theme';
import type { MatchFilterSlug } from '@/types/match';

const filterOptions: {
  description: string;
  emoji: string;
  label: string;
  value: MatchFilterSlug;
}[] = [
  {
    value: 'tudo',
    label: 'Tudo',
    emoji: '🍽️',
    description: 'Mistura geral para sair do impasse sem dó.',
  },
  {
    value: 'sobremesa',
    label: 'Sobremesa',
    emoji: '🍰',
    description: 'Doces, bolos e vontades açucaradas.',
  },
  {
    value: 'fome-grande',
    label: 'Fome grande',
    emoji: '🍔',
    description: 'Pratos reforçados para fome séria.',
  },
  {
    value: 'regional',
    label: 'Regional',
    emoji: '🇧🇷',
    description: 'Sabores brasileiros cheios de personalidade.',
  },
  {
    value: 'estrangeira',
    label: 'Estrangeira',
    emoji: '🌍',
    description: 'Uma volta ao mundo sem sair da mesa.',
  },
] as const;

export default function MatchCreateScreen() {
  const [nickname, setNickname] = useState('');
  const [filterSlug, setFilterSlug] = useState<MatchFilterSlug>('tudo');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreateRoom() {
    if (isSubmitting) {
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const result = await createMatchRoom({
        nickname,
        filterSlug,
      });

      router.replace(`/match/${result.code}`);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Não conseguimos criar a sala agora. Tente novamente.';
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
          Criar sala
        </Text>
        <Text style={styles.subtitle}>
          Escolha um apelido, defina o filtro da rodada e convide outra pessoa.
        </Text>

        <View style={styles.formCard}>
          <Text style={styles.fieldLabel}>Seu apelido</Text>
          <TextInput
            autoCapitalize="words"
            autoCorrect={false}
            maxLength={32}
            onChangeText={setNickname}
            placeholder="Ex.: Caio faminto"
            placeholderTextColor={colors.textMuted}
            returnKeyType="done"
            style={styles.input}
            value={nickname}
          />

          <Text style={[styles.fieldLabel, styles.filterLabel]}>Filtro da sala</Text>
          <View style={styles.filters}>
            {filterOptions.map((option) => {
              const isSelected = option.value === filterSlug;

              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: isSelected }}
                  onPress={() => setFilterSlug(option.value)}
                  style={({ pressed }) => [
                    styles.filterCard,
                    isSelected && styles.filterCardSelected,
                    pressed && styles.cardPressed,
                  ]}>
                  <Text style={styles.filterEmoji}>{option.emoji}</Text>
                  <Text style={styles.filterTitle}>{option.label}</Text>
                  <Text style={styles.filterDescription}>{option.description}</Text>
                </Pressable>
              );
            })}
          </View>

          {errorMessage && (
            <Text accessibilityLiveRegion="polite" style={styles.errorText}>
              {errorMessage}
            </Text>
          )}

          <Pressable
            accessibilityRole="button"
            disabled={isSubmitting}
            onPress={() => void handleCreateRoom()}
            style={({ pressed }) => [
              styles.primaryButton,
              isSubmitting && styles.buttonDisabled,
              pressed && styles.buttonPressed,
            ]}>
            <Text style={styles.primaryButtonText}>
              {isSubmitting ? 'Criando sala...' : 'Criar sala'}
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
  filterLabel: {
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
  filters: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
  filterCard: {
    backgroundColor: colors.background,
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
    borderWidth: 2,
    minHeight: 110,
    padding: spacing.md,
  },
  filterCardSelected: {
    backgroundColor: colors.mint,
    borderColor: colors.primary,
  },
  filterEmoji: {
    fontSize: 26,
  },
  filterTitle: {
    ...typography.heading,
    color: colors.text,
    marginTop: spacing.sm,
  },
  filterDescription: {
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
  cardPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
});

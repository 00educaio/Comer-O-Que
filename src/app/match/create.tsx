import { useState } from 'react';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ScreenShell } from '@/components/ui/app-shell';
import {
  AppButton,
  AppPill,
  FormField,
  Reveal,
  SurfaceCard,
} from '@/components/ui/app-primitives';
import { createMatchRoom } from '@/services/matchService';
import { colors, spacing, typography } from '@/theme/theme';
import type { MatchFilterSlug } from '@/types/match';

const filterOptions: {
  emoji: string;
  label: string;
  value: MatchFilterSlug;
}[] = [
  {
    value: 'tudo',
    label: 'Tudo',
    emoji: '🍽️',
  },
  {
    value: 'sobremesa',
    label: 'Sobremesa',
    emoji: '🍰',
  },
  {
    value: 'fome-grande',
    label: 'Fome grande',
    emoji: '🍔',
  },
  {
    value: 'regional',
    label: 'Regional',
    emoji: '🇧🇷',
  },
  {
    value: 'estrangeira',
    label: 'Estrangeira',
    emoji: '🌍',
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
    <ScreenShell
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      tone="match">
      <Reveal>
        <SurfaceCard
          contentStyle={styles.heroCardContent}
          gradientColors={['#FFA57D', '#E12B2D', '#89131D']}>
          <AppPill label="Criando a rodada" tone="cream" />
          <Text accessibilityRole="header" style={styles.heroTitle}>
            Crie a sala.
          </Text>
          <Text style={styles.heroSubtitle}>Escolha seu nome e o tipo de fome.</Text>
        </SurfaceCard>
      </Reveal>

      <Reveal delay={90}>
        <SurfaceCard contentStyle={styles.formCardContent}>
          <FormField
            autoCapitalize="words"
            autoCorrect={false}
            label="Seu apelido"
            maxLength={32}
            onChangeText={setNickname}
            placeholder="Ex.: Caio faminto"
            returnKeyType="done"
            value={nickname}
          />

          <View style={styles.filtersBlock}>
            <Text style={styles.fieldLabel}>Filtro da sala</Text>

            <View style={styles.filters}>
              {filterOptions.map((option) => {
                const isSelected = option.value === filterSlug;

                return (
                  <Pressable
                    accessibilityRole="radio"
                    accessibilityState={{ checked: isSelected }}
                    key={option.value}
                    onPress={() => setFilterSlug(option.value)}
                    style={({ pressed }) => [pressed && styles.optionPressed]}>
                    <SurfaceCard
                      contentStyle={styles.filterCardContent}
                      style={[
                        styles.filterCard,
                        isSelected && styles.filterCardSelected,
                      ]}
                      tone={isSelected ? 'mint' : 'warm'}>
                      <View style={styles.filterHeader}>
                        <Text style={styles.filterEmoji}>{option.emoji}</Text>
                        <Text
                          style={[
                            styles.filterTitle,
                            isSelected && styles.filterTitleSelected,
                          ]}>
                          {option.label}
                        </Text>
                        <Text
                          style={[
                            styles.filterCheck,
                            isSelected && styles.filterCheckSelected,
                          ]}>
                          {isSelected ? '✓' : '›'}
                        </Text>
                      </View>
                    </SurfaceCard>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {errorMessage ? (
            <Text accessibilityLiveRegion="polite" style={styles.errorText}>
              {errorMessage}
            </Text>
          ) : null}

          <AppButton
            disabled={isSubmitting}
            onPress={() => void handleCreateRoom()}
            style={styles.submitButton}
            title={isSubmitting ? 'Criando sala...' : 'Criar sala'}
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
  fieldLabel: {
    ...typography.subheading,
    color: colors.text,
  },
  filterCard: {
    minHeight: 76,
  },
  filterCardContent: {
    justifyContent: 'center',
    minHeight: 76,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  filterCardSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryStrong,
  },
  filterCheck: {
    color: colors.textMuted,
    fontFamily: typography.heading.fontFamily,
    fontSize: 28,
  },
  filterCheckSelected: {
    color: colors.onPrimary,
    fontSize: 20,
  },
  filterEmoji: {
    fontSize: 30,
  },
  filterHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  filterTitle: {
    ...typography.subheading,
    color: colors.text,
    flex: 1,
  },
  filterTitleSelected: {
    color: colors.onPrimary,
  },
  filters: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
  filtersBlock: {
    gap: spacing.xs,
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
  optionPressed: {
    opacity: 0.94,
    transform: [{ scale: 0.99 }],
  },
  submitButton: {
    marginTop: spacing.sm,
  },
});

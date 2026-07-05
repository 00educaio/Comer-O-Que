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
            Monte uma sala bonita e pronta para compartilhar.
          </Text>
          <Text style={styles.heroSubtitle}>
            Escolha um apelido, defina o filtro e o app prepara o lobby com código
            curto e link.
          </Text>
        </SurfaceCard>
      </Reveal>

      <Reveal delay={90}>
        <SurfaceCard contentStyle={styles.formCardContent}>
          <FormField
            autoCapitalize="words"
            autoCorrect={false}
            hint="É assim que a outra pessoa vai te ver na sala."
            label="Seu apelido"
            maxLength={32}
            onChangeText={setNickname}
            placeholder="Ex.: Caio faminto"
            returnKeyType="done"
            value={nickname}
          />

          <View style={styles.filtersBlock}>
            <Text style={styles.fieldLabel}>Filtro da sala</Text>
            <Text style={styles.fieldHint}>
              Escolha o clima da rodada antes de convidar.
            </Text>

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
                        <AppPill
                          label={isSelected ? 'Selecionado' : 'Toque para usar'}
                          tone={isSelected ? 'red' : 'cream'}
                        />
                      </View>
                      <Text style={styles.filterTitle}>{option.label}</Text>
                      <Text style={styles.filterDescription}>{option.description}</Text>
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
  fieldHint: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  fieldLabel: {
    ...typography.subheading,
    color: colors.text,
  },
  filterCard: {
    minHeight: 132,
  },
  filterCardContent: {
    minHeight: 132,
  },
  filterCardSelected: {
    borderColor: colors.primaryStrong,
  },
  filterDescription: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  filterEmoji: {
    fontSize: 30,
  },
  filterHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterTitle: {
    ...typography.heading,
    color: colors.text,
    marginTop: spacing.sm,
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

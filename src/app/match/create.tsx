import { useState } from 'react';
import { router } from 'expo-router';
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
        <AmbientBackground style={styles.ambient} tone="match">
          <View style={styles.heroCard}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>Criando a rodada</Text>
            </View>
            <Text accessibilityRole="header" style={styles.title}>
              Monte uma sala bonita e pronta para compartilhar.
            </Text>
            <Text style={styles.subtitle}>
              Escolha um apelido, defina o filtro e o app prepara o lobby com código
              curto e link.
            </Text>
          </View>

          <View style={styles.formCard}>
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Seu apelido</Text>
              <Text style={styles.fieldHint}>É assim que a outra pessoa vai te ver na sala.</Text>
              <TextInput
                autoCapitalize="words"
                autoCorrect={false}
                maxLength={32}
                onChangeText={setNickname}
                placeholder="Ex.: Caio faminto"
                placeholderTextColor={colors.textSoft}
                returnKeyType="done"
                style={styles.input}
                value={nickname}
              />
            </View>

            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Filtro da sala</Text>
              <Text style={styles.fieldHint}>Escolha o clima da rodada antes de convidar.</Text>
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
                      <View style={styles.filterHeader}>
                        <Text style={styles.filterEmoji}>{option.emoji}</Text>
                        <View style={[styles.filterBadge, isSelected && styles.filterBadgeSelected]}>
                          <Text
                            style={[
                              styles.filterBadgeText,
                              isSelected && styles.filterBadgeTextSelected,
                            ]}>
                            {isSelected ? 'Selecionado' : 'Toque para usar'}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.filterTitle}>{option.label}</Text>
                      <Text style={styles.filterDescription}>{option.description}</Text>
                    </Pressable>
                  );
                })}
              </View>
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
  filters: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  filterCard: {
    ...shadows.soft,
    backgroundColor: colors.surfaceWarm,
    borderColor: colors.cardBorderSoft,
    borderRadius: radius.lg,
    borderWidth: 1,
    minHeight: 124,
    padding: spacing.md,
  },
  filterCardSelected: {
    backgroundColor: colors.mint,
    borderColor: colors.primary,
    borderWidth: 2,
  },
  filterHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterEmoji: {
    fontSize: 30,
  },
  filterBadge: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.cardBorderSoft,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  filterBadgeSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterBadgeText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  filterBadgeTextSelected: {
    color: colors.onPrimary,
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
    marginTop: spacing.xl,
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
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.992 }],
  },
});

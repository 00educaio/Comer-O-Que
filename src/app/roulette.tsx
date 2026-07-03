import { Image } from 'expo-image';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  ErrorIllustration,
  LoadingIllustration,
} from '@/components/feedback-illustration';
import { openNearbyPlaces } from '@/lib/maps';
import { drawWeightedFood } from '@/lib/roulette';
import { getCatalog } from '@/services/catalogService';
import { colors, radius, shadows, spacing, typography } from '@/theme/theme';
import type { Food, RouletteGroup } from '@/types/catalog';

const SPIN_DURATION_MS = 3_500;
const PREVIEW_INTERVAL_MS = 110;

function logDevelopmentWarning(message: string, error: unknown) {
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.warn(`[RouletteScreen] ${message}`, error);
  }
}

export default function RouletteScreen() {
  const [catalog, setCatalog] = useState<RouletteGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<RouletteGroup | null>(null);
  const [displayedFood, setDisplayedFood] = useState<Food | null>(null);
  const [result, setResult] = useState<Food | null>(null);
  const [areOptionsVisible, setAreOptionsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [spinError, setSpinError] = useState<string | null>(null);
  const [mapsError, setMapsError] = useState<string | null>(null);
  const previewTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resultTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearSpinTimers = useCallback(() => {
    if (previewTimerRef.current) {
      clearInterval(previewTimerRef.current);
      previewTimerRef.current = null;
    }

    if (resultTimerRef.current) {
      clearTimeout(resultTimerRef.current);
      resultTimerRef.current = null;
    }
  }, []);

  const loadCatalog = useCallback(async () => {
    setIsLoading(true);
    setCatalogError(null);

    try {
      const loadedCatalog = await getCatalog();
      setCatalog(loadedCatalog);

      if (loadedCatalog.length === 0) {
        setCatalogError('As roletas estão sem opções agora. Tente novamente em instantes.');
      }
    } catch (error) {
      logDevelopmentWarning('Falha inesperada ao carregar o catálogo.', error);
      setCatalog([]);
      setCatalogError('Não conseguimos preparar as roletas. Que tal tentar de novo?');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    void getCatalog()
      .then((loadedCatalog) => {
        if (!isMounted) {
          return;
        }

        setCatalog(loadedCatalog);

        if (loadedCatalog.length === 0) {
          setCatalogError('As roletas estão sem opções agora. Tente novamente em instantes.');
        }
      })
      .catch((error: unknown) => {
        logDevelopmentWarning('Falha inesperada ao carregar o catálogo.', error);

        if (isMounted) {
          setCatalog([]);
          setCatalogError('Não conseguimos preparar as roletas. Que tal tentar de novo?');
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => clearSpinTimers, [clearSpinTimers]);

  function selectGroup(group: RouletteGroup) {
    if (isSpinning) {
      return;
    }

    clearSpinTimers();
    setSelectedGroup(group);
    setAreOptionsVisible(false);
    setDisplayedFood(null);
    setResult(null);
    setSpinError(null);
    setMapsError(null);
  }

  function spin() {
    if (!selectedGroup || isSpinning) {
      return;
    }

    const finalFood = drawWeightedFood(selectedGroup.foods);

    if (!finalFood) {
      setDisplayedFood(null);
      setResult(null);
      setSpinError('Essa roleta está sem pratos por enquanto. Escolha outra para continuar.');
      return;
    }

    clearSpinTimers();
    setIsSpinning(true);
    setResult(null);
    setSpinError(null);
    setMapsError(null);

    let previewIndex = Math.floor(Math.random() * selectedGroup.foods.length);
    setDisplayedFood(selectedGroup.foods[previewIndex]?.food ?? finalFood);

    previewTimerRef.current = setInterval(() => {
      previewIndex = (previewIndex + 1) % selectedGroup.foods.length;
      setDisplayedFood(selectedGroup.foods[previewIndex]?.food ?? finalFood);
    }, PREVIEW_INTERVAL_MS);

    resultTimerRef.current = setTimeout(() => {
      if (previewTimerRef.current) {
        clearInterval(previewTimerRef.current);
        previewTimerRef.current = null;
      }

      resultTimerRef.current = null;
      setDisplayedFood(finalFood);
      setResult(finalFood);
      setIsSpinning(false);
    }, SPIN_DURATION_MS);
  }

  async function showNearbyPlaces() {
    if (!result) {
      return;
    }

    setMapsError(null);

    try {
      await openNearbyPlaces(result.searchQuery);
    } catch (error) {
      logDevelopmentWarning('Não foi possível abrir o Google Maps.', error);
      setMapsError('Não conseguimos abrir o Maps. Tente novamente.');
    }
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}>
      <SafeAreaView edges={['bottom']} style={styles.safeArea}>
        <View style={styles.header}>
          <Image
            accessible={false}
            contentFit="cover"
            source={require('../../assets/images/ComerOQue/mode-roulette-illustration.png')}
            style={styles.modeIllustration}
          />
          <Text accessibilityRole="header" style={styles.title}>
            Qual é a fome de hoje?
          </Text>
          <Text style={styles.subtitle}>
            Escolha uma categoria e deixe a sorte cuidar do cardápio.
          </Text>
        </View>

        {isLoading ? (
          <View accessibilityLiveRegion="polite" style={styles.feedbackCard}>
            <LoadingIllustration />
            <Text style={styles.feedbackTitle}>Preparando as roletas...</Text>
            <Text style={styles.feedbackText}>Já já a sorte entra em ação.</Text>
          </View>
        ) : catalogError ? (
          <View accessibilityLiveRegion="polite" style={styles.feedbackCard}>
            <ErrorIllustration />
            <Text style={styles.feedbackTitle}>Ops, a mesa ainda não está pronta</Text>
            <Text style={styles.feedbackText}>{catalogError}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => void loadCatalog()}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.buttonPressed,
              ]}>
              <Text style={styles.secondaryButtonText}>Tentar novamente</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View accessibilityRole="radiogroup" style={styles.groupList}>
              {catalog.map((group) => {
                const isSelected = selectedGroup?.id === group.id;

                return (
                  <Pressable
                    key={group.id}
                    accessibilityHint="Seleciona esta categoria para o sorteio"
                    accessibilityLabel={`${group.name}. ${group.description ?? ''}`}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: isSelected, disabled: isSpinning }}
                    disabled={isSpinning}
                    onPress={() => selectGroup(group)}
                    style={({ pressed }) => [
                      styles.groupCard,
                      isSelected && styles.groupCardSelected,
                      pressed && styles.cardPressed,
                      isSpinning && styles.cardDisabled,
                    ]}>
                    <View style={styles.groupEmojiBubble}>
                      <Text style={styles.groupEmoji}>{group.emoji ?? '🍽️'}</Text>
                    </View>
                    <View style={styles.groupCopy}>
                      <Text style={styles.groupName}>{group.name}</Text>
                      <Text style={styles.groupDescription}>
                        {group.description ?? 'Uma seleção surpresa para você.'}
                      </Text>
                    </View>
                    <Text style={[styles.selectionMark, isSelected && styles.selectionMarkActive]}>
                      {isSelected ? '✓' : '›'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {selectedGroup && (
              <View style={styles.spinCard}>
                <Text style={styles.selectedLabel}>ROLETA ESCOLHIDA</Text>
                <Text style={styles.selectedName}>
                  {selectedGroup.emoji ?? '🍽️'} {selectedGroup.name}
                </Text>

                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ expanded: areOptionsVisible }}
                  onPress={() => setAreOptionsVisible((isVisible) => !isVisible)}
                  style={({ pressed }) => [
                    styles.optionsToggle,
                    pressed && styles.buttonPressed,
                  ]}>
                  <Text style={styles.optionsToggleText}>
                    {areOptionsVisible
                      ? 'Ocultar opções'
                      : `Ver opções (${selectedGroup.foods.length})`}
                  </Text>
                  <Text style={styles.optionsToggleIcon}>
                    {areOptionsVisible ? '⌃' : '⌄'}
                  </Text>
                </Pressable>

                {areOptionsVisible && (
                  <View style={styles.optionsList}>
                    <Text style={styles.optionsTitle}>Pode cair:</Text>
                    <View style={styles.optionChips}>
                      {selectedGroup.foods.map(({ food }) => (
                        <View key={food.id} style={styles.optionChip}>
                          <Text style={styles.optionEmoji}>{food.emoji ?? '🍽️'}</Text>
                          <Text style={styles.optionName}>{food.name}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {displayedFood ? (
                  <View
                    accessibilityLiveRegion={result ? 'polite' : 'none'}
                    style={styles.foodResult}>
                    {result && <Text style={styles.resultLabel}>Deu:</Text>}
                    <Text style={[styles.foodEmoji, isSpinning && styles.foodEmojiSpinning]}>
                      {displayedFood.emoji ?? '🍽️'}
                    </Text>
                    <Text style={styles.foodName}>{displayedFood.name}</Text>
                    {result && (
                      <Text style={styles.foodDescription}>
                        {displayedFood.description ?? 'Uma escolha deliciosa para agora.'}
                      </Text>
                    )}
                  </View>
                ) : (
                  <View style={styles.readyState}>
                    <Text style={styles.readyEmoji}>✨</Text>
                    <Text style={styles.readyText}>
                      Tudo pronto. Toque em Girar para descobrir.
                    </Text>
                  </View>
                )}

                {spinError && (
                  <Text accessibilityLiveRegion="polite" style={styles.errorText}>
                    {spinError}
                  </Text>
                )}

                {result ? (
                  <View style={styles.actions}>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => void showNearbyPlaces()}
                      style={({ pressed }) => [
                        styles.primaryButton,
                        pressed && styles.buttonPressed,
                      ]}>
                      <Text style={styles.primaryButtonText}>Ver lugares próximos</Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      onPress={spin}
                      style={({ pressed }) => [
                        styles.secondaryButton,
                        pressed && styles.buttonPressed,
                      ]}>
                      <Text style={styles.secondaryButtonText}>Girar de novo</Text>
                    </Pressable>
                  </View>
                ) : (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ disabled: isSpinning }}
                    disabled={isSpinning}
                    onPress={spin}
                    style={({ pressed }) => [
                      styles.primaryButton,
                      isSpinning && styles.buttonDisabled,
                      pressed && styles.buttonPressed,
                    ]}>
                    <Text style={styles.primaryButtonText}>
                      {isSpinning ? 'Sorteando...' : 'Girar'}
                    </Text>
                  </Pressable>
                )}

                {mapsError && (
                  <Text accessibilityLiveRegion="polite" style={styles.errorText}>
                    {mapsError}
                  </Text>
                )}
              </View>
            )}
          </>
        )}
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
    maxWidth: 720,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
    width: '100%',
  },
  header: {
    alignItems: 'center',
    paddingBottom: spacing.lg,
    paddingTop: spacing.lg,
  },
  modeIllustration: {
    borderColor: colors.cardBorder,
    borderRadius: radius.lg,
    borderWidth: 2,
    height: 260,
    width: '100%',
  },
  title: {
    ...typography.heading,
    color: colors.text,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.sm,
    maxWidth: 440,
    textAlign: 'center',
  },
  feedbackCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.cardBorder,
    borderRadius: radius.lg,
    borderWidth: 2,
    padding: spacing.xl,
    ...shadows.card,
  },
  feedbackTitle: {
    ...typography.heading,
    color: colors.text,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  feedbackText: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  groupList: {
    gap: spacing.md,
  },
  groupCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.cardBorder,
    borderRadius: radius.lg,
    borderWidth: 2,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 112,
    padding: spacing.md,
    ...shadows.card,
  },
  groupCardSelected: {
    backgroundColor: colors.yellow,
    borderColor: colors.primary,
    borderWidth: 3,
  },
  cardPressed: {
    opacity: 0.84,
    transform: [{ scale: 0.99 }],
  },
  cardDisabled: {
    opacity: 0.62,
  },
  groupEmojiBubble: {
    alignItems: 'center',
    backgroundColor: colors.surfaceTranslucent,
    borderRadius: radius.md,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  groupEmoji: {
    fontSize: 36,
  },
  groupCopy: {
    flex: 1,
  },
  groupName: {
    ...typography.heading,
    color: colors.text,
  },
  groupDescription: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  selectionMark: {
    color: colors.textMuted,
    fontSize: 34,
    fontWeight: '900',
    width: 28,
  },
  selectionMarkActive: {
    color: colors.primary,
    fontSize: 24,
  },
  spinCard: {
    alignItems: 'center',
    backgroundColor: colors.pink,
    borderColor: colors.cardBorder,
    borderRadius: radius.lg,
    borderWidth: 2,
    marginTop: spacing.xl,
    padding: spacing.lg,
    ...shadows.card,
  },
  selectedLabel: {
    ...typography.caption,
    color: colors.primaryDark,
    letterSpacing: 1,
  },
  selectedName: {
    ...typography.heading,
    color: colors.text,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  optionsToggle: {
    alignItems: 'center',
    borderColor: colors.primary,
    borderRadius: radius.pill,
    borderWidth: 2,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    marginTop: spacing.md,
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  optionsToggleText: {
    ...typography.button,
    color: colors.primary,
  },
  optionsToggleIcon: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: '900',
  },
  optionsList: {
    alignSelf: 'stretch',
    backgroundColor: colors.surfaceTranslucent,
    borderRadius: radius.md,
    marginTop: spacing.md,
    padding: spacing.md,
  },
  optionsTitle: {
    ...typography.caption,
    color: colors.primaryDark,
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  optionChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  optionChip: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.cardBorder,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    maxWidth: '100%',
    minHeight: 40,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  optionEmoji: {
    fontSize: 18,
  },
  optionName: {
    ...typography.body,
    color: colors.text,
    flexShrink: 1,
  },
  readyState: {
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  readyEmoji: {
    fontSize: 48,
  },
  readyText: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  foodResult: {
    alignItems: 'center',
    marginVertical: spacing.lg,
    minHeight: 176,
  },
  resultLabel: {
    ...typography.heading,
    color: colors.primary,
  },
  foodEmoji: {
    fontSize: 70,
    marginTop: spacing.xs,
  },
  foodEmojiSpinning: {
    transform: [{ scale: 0.94 }, { rotate: '-3deg' }],
  },
  foodName: {
    ...typography.heading,
    color: colors.text,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  foodDescription: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  actions: {
    gap: spacing.sm,
    width: '100%',
  },
  primaryButton: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    minHeight: 54,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  primaryButtonText: {
    ...typography.button,
    color: colors.onPrimary,
    textAlign: 'center',
  },
  secondaryButton: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    borderRadius: radius.pill,
    borderWidth: 2,
    justifyContent: 'center',
    marginTop: spacing.md,
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  secondaryButtonText: {
    ...typography.button,
    color: colors.primary,
    textAlign: 'center',
  },
  buttonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    backgroundColor: colors.textMuted,
    opacity: 0.7,
  },
  errorText: {
    ...typography.body,
    color: colors.primaryDark,
    marginTop: spacing.md,
    textAlign: 'center',
  },
});

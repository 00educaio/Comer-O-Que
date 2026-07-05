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
import { CelebrationOverlay } from '@/components/celebration-overlay';
import { FoodArtwork } from '@/components/food-artwork';
import { AmbientBackground } from '@/components/ui/ambient-background';
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
  const celebrationKey = result ? `${selectedGroup?.id ?? 'roulette'}:${result.id}` : null;

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
        <AmbientBackground style={styles.ambient} tone="roulette">
          <View style={styles.header}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>Roleta com suspense</Text>
            </View>
            <Image
              accessible={false}
              contentFit="contain"
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
                      <View style={styles.groupHeader}>
                        <View style={styles.groupEmojiBubble}>
                          <Text style={styles.groupEmoji}>{group.emoji ?? '🍽️'}</Text>
                        </View>
                        <View
                          style={[
                            styles.groupBadge,
                            isSelected && styles.groupBadgeSelected,
                          ]}>
                          <Text
                            style={[
                              styles.groupBadgeText,
                              isSelected && styles.groupBadgeTextSelected,
                            ]}>
                            {isSelected ? 'Selecionada' : `${group.foods.length} opções`}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.groupCopy}>
                        <Text style={styles.groupName}>{group.name}</Text>
                        <Text style={styles.groupDescription}>
                          {group.description ?? 'Uma seleção surpresa para você.'}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.selectionMark,
                          isSelected && styles.selectionMarkActive,
                        ]}>
                        {isSelected ? '✓' : '›'}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {selectedGroup && (
                <View style={styles.spinCard}>
                  <Text style={styles.selectedLabel}>Roleta escolhida</Text>
                  <Text style={styles.selectedName}>
                    {selectedGroup.emoji ?? '🍽️'} {selectedGroup.name}
                  </Text>
                  <Text style={styles.selectedDescription}>
                    {selectedGroup.description ?? 'Uma seleção pronta para surpreender você.'}
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
                            <FoodArtwork
                              containerStyle={styles.optionArtwork}
                              fallbackTextStyle={styles.optionArtworkFallback}
                              food={food}
                              imageStyle={styles.optionArtworkImage}
                            />
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
                      <View style={styles.foodSpotlight} />
                      <FoodArtwork
                        key={displayedFood.id}
                        containerStyle={[
                          styles.foodArtwork,
                          isSpinning && styles.foodArtworkSpinning,
                        ]}
                        fallbackTextStyle={styles.foodArtworkFallback}
                        food={displayedFood}
                        imageStyle={styles.foodArtworkImage}
                      />
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
        </AmbientBackground>
        <CelebrationOverlay
          message="A roleta escolheu uma boa pedida para agora."
          title="Saiu o resultado!"
          tone="roulette"
          triggerKey={celebrationKey}
        />
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
  ambient: {
    borderRadius: radius.xl,
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  header: {
    ...shadows.floating,
    alignItems: 'center',
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.cardBorder,
    borderRadius: radius.xl,
    borderWidth: 2,
    padding: spacing.lg,
    paddingBottom: spacing.lg,
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
  modeIllustration: {
    height: 260,
    marginTop: spacing.sm,
    width: '100%',
  },
  title: {
    ...typography.title,
    color: colors.text,
    marginTop: spacing.md,
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
    ...shadows.floating,
    alignItems: 'center',
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.cardBorder,
    borderRadius: radius.xl,
    borderWidth: 2,
    padding: spacing.xl,
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
    ...shadows.card,
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.cardBorder,
    borderRadius: radius.lg,
    borderWidth: 2,
    gap: spacing.md,
    minHeight: 164,
    padding: spacing.md,
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
  groupHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  groupEmojiBubble: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  groupEmoji: {
    fontSize: 36,
  },
  groupCopy: {
    gap: spacing.xs,
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
  groupBadge: {
    backgroundColor: colors.surfaceWarm,
    borderColor: colors.cardBorderSoft,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  groupBadgeSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  groupBadgeText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  groupBadgeTextSelected: {
    color: colors.onPrimary,
  },
  selectionMark: {
    alignSelf: 'flex-end',
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
    ...shadows.floating,
    alignItems: 'center',
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.cardBorder,
    borderRadius: radius.xl,
    borderWidth: 2,
    marginTop: spacing.xl,
    padding: spacing.lg,
  },
  selectedLabel: {
    ...typography.label,
    color: colors.primaryDark,
    textTransform: 'uppercase',
  },
  selectedName: {
    ...typography.heading,
    color: colors.text,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  selectedDescription: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  optionsToggle: {
    alignItems: 'center',
    backgroundColor: colors.surfaceWarm,
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
    backgroundColor: colors.primaryGlow,
    borderRadius: radius.lg,
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
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.cardBorderSoft,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    maxWidth: '100%',
    minHeight: 40,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  optionArtwork: {
    borderRadius: radius.pill,
    height: 26,
    width: 26,
  },
  optionArtworkImage: {
    borderRadius: radius.pill,
  },
  optionArtworkFallback: {
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
    position: 'relative',
  },
  resultLabel: {
    ...typography.heading,
    color: colors.primary,
  },
  foodSpotlight: {
    backgroundColor: colors.primaryGlow,
    borderRadius: radius.pill,
    height: 126,
    opacity: 0.9,
    position: 'absolute',
    top: 34,
    width: 126,
  },
  foodArtwork: {
    ...shadows.card,
    borderRadius: radius.lg,
    height: 148,
    marginTop: spacing.sm,
    width: 148,
    zIndex: 1,
  },
  foodArtworkImage: {
    borderRadius: radius.lg,
  },
  foodArtworkFallback: {
    fontSize: 70,
  },
  foodArtworkSpinning: {
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
    marginTop: spacing.sm,
    width: '100%',
  },
  primaryButton: {
    ...shadows.soft,
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    minHeight: 58,
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
    ...shadows.soft,
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: colors.surfaceWarm,
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

import { Image } from 'expo-image';
import { useCallback, useEffect, useState } from 'react';
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
import { FoodArtwork } from '@/components/food-artwork';
import { interviewQuestions } from '@/data/interviewQuestions';
import { openNearbyPlaces } from '@/lib/maps';
import { getCatalog } from '@/services/catalogService';
import { rankInterviewFoods } from '@/services/interviewService';
import { colors, radius, shadows, spacing, typography } from '@/theme/theme';
import type { RouletteGroup } from '@/types/catalog';
import type {
  InterviewAnswer,
  InterviewRecommendation,
} from '@/types/interview';

function logDevelopmentWarning(message: string, error: unknown) {
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.warn(`[InterviewScreen] ${message}`, error);
  }
}

export default function InterviewScreen() {
  const [catalog, setCatalog] = useState<RouletteGroup[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<InterviewAnswer[]>([]);
  const [recommendations, setRecommendations] = useState<InterviewRecommendation[] | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [mapsError, setMapsError] = useState<string | null>(null);
  const currentQuestion = interviewQuestions[currentQuestionIndex];

  const loadCatalog = useCallback(async () => {
    setIsLoading(true);
    setCatalogError(null);

    try {
      const loadedCatalog = await getCatalog();
      setCatalog(loadedCatalog);

      if (loadedCatalog.length === 0) {
        setCatalogError('As sugestões tiraram uma folga. Tente novamente em instantes.');
      }
    } catch (error) {
      logDevelopmentWarning('Falha inesperada ao carregar o catálogo.', error);
      setCatalog([]);
      setCatalogError('Não conseguimos preparar a entrevista. Que tal tentar de novo?');
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
          setCatalogError('As sugestões tiraram uma folga. Tente novamente em instantes.');
        }
      })
      .catch((error: unknown) => {
        logDevelopmentWarning('Falha inesperada ao carregar o catálogo.', error);

        if (isMounted) {
          setCatalog([]);
          setCatalogError('Não conseguimos preparar a entrevista. Que tal tentar de novo?');
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

  function answerQuestion(optionId: string) {
    if (!currentQuestion) {
      return;
    }

    const nextAnswer = { questionId: currentQuestion.id, optionId };
    const nextAnswers = [
      ...answers.filter((answer) => answer.questionId !== currentQuestion.id),
      nextAnswer,
    ];

    setAnswers(nextAnswers);
    setMapsError(null);

    if (currentQuestionIndex === interviewQuestions.length - 1) {
      setRecommendations(
        rankInterviewFoods(catalog, interviewQuestions, nextAnswers),
      );
      return;
    }

    setCurrentQuestionIndex((index) => index + 1);
  }

  function goBack() {
    if (currentQuestionIndex === 0) {
      return;
    }

    setMapsError(null);
    setCurrentQuestionIndex((index) => index - 1);
  }

  function restartInterview() {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setRecommendations(null);
    setMapsError(null);
  }

  async function showNearbyPlaces(searchQuery: string) {
    setMapsError(null);

    try {
      await openNearbyPlaces(searchQuery);
    } catch (error) {
      logDevelopmentWarning('Não foi possível abrir o Google Maps.', error);
      setMapsError('Não conseguimos abrir o Maps. Tente novamente.');
    }
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      style={styles.screen}>
      <SafeAreaView edges={['bottom']} style={styles.safeArea}>
        {isLoading ? (
          <View accessibilityLiveRegion="polite" style={styles.feedbackCard}>
            <LoadingIllustration />
            <Text style={styles.feedbackTitle}>Arrumando as perguntas...</Text>
            <Text style={styles.feedbackText}>É rapidinho, prometemos.</Text>
          </View>
        ) : catalogError ? (
          <View accessibilityLiveRegion="polite" style={styles.feedbackCard}>
            <ErrorIllustration />
            <Text style={styles.feedbackTitle}>A cozinha se atrapalhou</Text>
            <Text style={styles.feedbackText}>{catalogError}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => void loadCatalog()}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.buttonPressed,
              ]}>
              <Text style={styles.primaryButtonText}>Tentar novamente</Text>
            </Pressable>
          </View>
        ) : recommendations ? (
          <View style={styles.results}>
            <View style={styles.header}>
              <Text style={styles.headerEmoji}>🎯</Text>
              <Text accessibilityRole="header" style={styles.title}>
                Temos um palpite!
              </Text>
              <Text style={styles.subtitle}>
                Seu gosto falou alto. Agora é só escolher.
              </Text>
            </View>

            {recommendations.length > 0 ? (
              <>
                <RecommendationCard
                  isBest
                  onOpenMaps={showNearbyPlaces}
                  recommendation={recommendations[0]}
                />
                <Text style={styles.otherTitle}>Outras boas pedidas</Text>
                {recommendations.slice(1).map((recommendation) => (
                  <RecommendationCard
                    key={recommendation.food.id}
                    onOpenMaps={showNearbyPlaces}
                    recommendation={recommendation}
                  />
                ))}
              </>
            ) : (
              <View style={styles.feedbackCard}>
                <Text style={styles.feedbackEmoji}>🧐</Text>
                <Text style={styles.feedbackTitle}>Nenhum prato combinou</Text>
                <Text style={styles.feedbackText}>
                  Vamos tentar respostas diferentes?
                </Text>
              </View>
            )}

            {mapsError && (
              <Text accessibilityLiveRegion="polite" style={styles.errorText}>
                {mapsError}
              </Text>
            )}

            <Pressable
              accessibilityRole="button"
              onPress={restartInterview}
              style={({ pressed }) => [
                styles.restartButton,
                pressed && styles.buttonPressed,
              ]}>
              <Text style={styles.restartButtonText}>Refazer entrevista</Text>
            </Pressable>
          </View>
        ) : currentQuestion ? (
          <View style={styles.interview}>
            <View style={styles.header}>
              {currentQuestionIndex === 0 ? (
                <Image
                  accessible={false}
                  contentFit="cover"
                  source={require('../../assets/images/ComerOQue/mode-interview-illustration.png')}
                  style={styles.modeIllustration}
                />
              ) : (
                <Text style={styles.headerEmoji}>🎤</Text>
              )}
              <Text accessibilityRole="header" style={styles.title}>
                Conta pra gente
              </Text>
              <Text style={styles.subtitle}>
                Oito perguntinhas e a indecisão sai do cardápio.
              </Text>
            </View>

            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>
                Pergunta {currentQuestionIndex + 1}/{interviewQuestions.length}
              </Text>
              <Text style={styles.progressPercent}>
                {Math.round(
                  ((currentQuestionIndex + 1) / interviewQuestions.length) * 100,
                )}
                %
              </Text>
            </View>
            <View
              accessibilityLabel={`Progresso: pergunta ${currentQuestionIndex + 1} de ${interviewQuestions.length}`}
              accessibilityRole="progressbar"
              accessibilityValue={{
                min: 1,
                max: interviewQuestions.length,
                now: currentQuestionIndex + 1,
              }}
              style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${((currentQuestionIndex + 1) / interviewQuestions.length) * 100}%`,
                  },
                ]}
              />
            </View>

            <View style={styles.questionCard}>
              <Text style={styles.question}>{currentQuestion.prompt}</Text>
              <View style={styles.answerList}>
                {currentQuestion.options.map((option) => {
                  const isSelected = answers.some(
                    (answer) =>
                      answer.questionId === currentQuestion.id
                      && answer.optionId === option.id,
                  );

                  return (
                    <Pressable
                      key={option.id}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      onPress={() => answerQuestion(option.id)}
                      style={({ pressed }) => [
                        styles.answerButton,
                        isSelected && styles.answerButtonSelected,
                        pressed && styles.buttonPressed,
                      ]}>
                      <Text style={styles.answerEmoji}>{option.emoji}</Text>
                      <Text style={styles.answerText}>{option.label}</Text>
                      <Text style={styles.answerArrow}>{isSelected ? '✓' : '›'}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: currentQuestionIndex === 0 }}
              disabled={currentQuestionIndex === 0}
              onPress={goBack}
              style={({ pressed }) => [
                styles.backButton,
                currentQuestionIndex === 0 && styles.buttonDisabled,
                pressed && styles.buttonPressed,
              ]}>
              <Text style={styles.backButtonText}>← Voltar uma pergunta</Text>
            </Pressable>
          </View>
        ) : null}
      </SafeAreaView>
    </ScrollView>
  );
}

type RecommendationCardProps = {
  recommendation: InterviewRecommendation | undefined;
  isBest?: boolean;
  onOpenMaps: (searchQuery: string) => Promise<void>;
};

function RecommendationCard({
  recommendation,
  isBest = false,
  onOpenMaps,
}: RecommendationCardProps) {
  if (!recommendation) {
    return null;
  }

  const { food } = recommendation;

  return (
    <View style={[styles.resultCard, isBest && styles.bestResultCard]}>
      {isBest && <Text style={styles.bestLabel}>MELHOR PALPITE</Text>}
      <View style={styles.resultHeading}>
        <FoodArtwork
          key={food.id}
          containerStyle={[styles.resultArtwork, isBest && styles.bestResultArtwork]}
          fallbackTextStyle={[
            styles.resultArtworkFallback,
            isBest && styles.bestResultArtworkFallback,
          ]}
          food={food}
          imageStyle={[styles.resultArtworkImage, isBest && styles.bestResultArtworkImage]}
        />
        <View style={styles.resultCopy}>
          <Text style={[styles.resultName, isBest && styles.bestResultName]}>
            {food.name}
          </Text>
          {food.description && (
            <Text style={styles.resultDescription}>{food.description}</Text>
          )}
        </View>
      </View>
      <Pressable
        accessibilityLabel={`Ver lugares próximos com ${food.name}`}
        accessibilityRole="link"
        onPress={() => void onOpenMaps(food.searchQuery)}
        style={({ pressed }) => [
          styles.mapsButton,
          pressed && styles.buttonPressed,
        ]}>
        <Text style={styles.mapsButtonText}>Ver lugares próximos</Text>
      </Pressable>
    </View>
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
    maxWidth: 620,
    padding: spacing.lg,
    width: '100%',
  },
  interview: {
    flex: 1,
  },
  results: {
    gap: spacing.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerEmoji: {
    fontSize: 52,
  },
  modeIllustration: {
    borderColor: colors.cardBorder,
    borderRadius: radius.lg,
    borderWidth: 2,
    height: 240,
    width: '100%',
  },
  title: {
    ...typography.title,
    color: colors.text,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  progressLabel: {
    ...typography.button,
    color: colors.text,
  },
  progressPercent: {
    ...typography.button,
    color: colors.primary,
  },
  progressTrack: {
    backgroundColor: colors.pink,
    borderRadius: radius.pill,
    height: 12,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    height: '100%',
  },
  questionCard: {
    ...shadows.card,
    backgroundColor: colors.surface,
    borderColor: colors.cardBorder,
    borderRadius: radius.lg,
    borderWidth: 2,
    padding: spacing.lg,
  },
  question: {
    ...typography.heading,
    color: colors.text,
    textAlign: 'center',
  },
  answerList: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  answerButton: {
    alignItems: 'center',
    backgroundColor: colors.yellow,
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
    borderWidth: 2,
    flexDirection: 'row',
    minHeight: 66,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  answerButtonSelected: {
    backgroundColor: colors.mint,
  },
  answerEmoji: {
    fontSize: 30,
    width: 46,
  },
  answerText: {
    ...typography.button,
    color: colors.text,
    flex: 1,
  },
  answerArrow: {
    color: colors.primary,
    fontSize: 26,
    fontWeight: '900',
  },
  backButton: {
    alignItems: 'center',
    alignSelf: 'center',
    minHeight: 48,
    justifyContent: 'center',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  backButtonText: {
    ...typography.button,
    color: colors.primaryDark,
  },
  buttonDisabled: {
    opacity: 0.35,
  },
  buttonPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
  feedbackCard: {
    ...shadows.card,
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.pink,
    borderColor: colors.cardBorder,
    borderRadius: radius.lg,
    borderWidth: 2,
    marginVertical: 'auto',
    padding: spacing.xl,
    width: '100%',
  },
  feedbackEmoji: {
    fontSize: 52,
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
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    marginTop: spacing.lg,
    minHeight: 52,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  primaryButtonText: {
    ...typography.button,
    color: colors.onPrimary,
  },
  resultCard: {
    ...shadows.card,
    backgroundColor: colors.surface,
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
    borderWidth: 2,
    padding: spacing.md,
  },
  bestResultCard: {
    backgroundColor: colors.yellow,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  bestLabel: {
    ...typography.caption,
    color: colors.primaryDark,
    letterSpacing: 1.2,
    marginBottom: spacing.md,
  },
  resultHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  resultArtwork: {
    borderRadius: radius.md,
    height: 74,
    width: 74,
  },
  resultArtworkImage: {
    borderRadius: radius.md,
  },
  resultArtworkFallback: {
    fontSize: 42,
  },
  bestResultArtwork: {
    borderRadius: radius.lg,
    height: 112,
    width: 112,
  },
  bestResultArtworkImage: {
    borderRadius: radius.lg,
  },
  bestResultArtworkFallback: {
    fontSize: 64,
  },
  resultCopy: {
    flex: 1,
  },
  resultName: {
    ...typography.button,
    color: colors.text,
  },
  bestResultName: {
    ...typography.heading,
  },
  resultDescription: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  mapsButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    justifyContent: 'center',
    marginTop: spacing.md,
    minHeight: 50,
    paddingHorizontal: spacing.md,
  },
  mapsButtonText: {
    ...typography.button,
    color: colors.onPrimary,
    textAlign: 'center',
  },
  otherTitle: {
    ...typography.heading,
    color: colors.text,
    marginTop: spacing.sm,
  },
  errorText: {
    ...typography.body,
    color: colors.primaryDark,
    textAlign: 'center',
  },
  restartButton: {
    alignItems: 'center',
    borderColor: colors.primary,
    borderRadius: radius.pill,
    borderWidth: 2,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: spacing.lg,
  },
  restartButtonText: {
    ...typography.button,
    color: colors.primaryDark,
  },
});

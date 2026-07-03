import type { RouletteGroup } from '@/types/catalog';
import type {
  InterviewAnswer,
  InterviewQuestion,
  InterviewRecommendation,
} from '@/types/interview';

const DEFAULT_RECOMMENDATION_LIMIT = 5;

export function rankInterviewFoods(
  catalog: RouletteGroup[],
  questions: InterviewQuestion[],
  answers: InterviewAnswer[],
  limit = DEFAULT_RECOMMENDATION_LIMIT,
): InterviewRecommendation[] {
  if (!Number.isInteger(limit) || limit < 1) {
    return [];
  }

  const optionsByAnswer = new Map(
    questions.flatMap((question) =>
      question.options.map((option) => [
        `${question.id}:${option.id}`,
        option,
      ] as const),
    ),
  );
  const selectedOptions = answers.flatMap((answer) => {
    const option = optionsByAnswer.get(`${answer.questionId}:${answer.optionId}`);
    return option ? [option] : [];
  });
  const tagPoints = new Map<string, number>();
  const requiredTags = new Set<string>();

  for (const option of selectedOptions) {
    for (const { tag, points } of option.tagScores) {
      tagPoints.set(tag, (tagPoints.get(tag) ?? 0) + points);
    }

    for (const tag of option.requiredTags ?? []) {
      requiredTags.add(tag);
    }
  }

  const uniqueFoods = new Map(
    catalog.flatMap((group) =>
      group.foods.map(({ food }) => [food.id, food] as const),
    ),
  );

  return [...uniqueFoods.values()]
    .filter((food) => [...requiredTags].every((tag) => food.tags.includes(tag)))
    .map((food, catalogIndex) => ({
      food,
      score: food.tags.reduce(
        (total, tag) => total + (tagPoints.get(tag) ?? 0),
        0,
      ),
      catalogIndex,
    }))
    .sort((left, right) =>
      right.score - left.score || left.catalogIndex - right.catalogIndex,
    )
    .slice(0, limit)
    .map(({ food, score }) => ({ food, score }));
}

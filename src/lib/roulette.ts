import type { Food, RouletteGroupFood } from '@/types/catalog';

export function drawWeightedFood(
  options: RouletteGroupFood[],
  random: () => number = Math.random,
): Food | null {
  const validOptions = options.filter(
    ({ weight }) => Number.isFinite(weight) && weight > 0,
  );
  const totalWeight = validOptions.reduce(
    (total, { weight }) => total + weight,
    0,
  );

  if (validOptions.length === 0 || totalWeight <= 0) {
    return null;
  }

  const randomValue = random();
  const normalizedRandom = Number.isFinite(randomValue)
    ? Math.min(Math.max(randomValue, 0), 1 - Number.EPSILON)
    : Math.random();
  const targetWeight = normalizedRandom * totalWeight;
  let accumulatedWeight = 0;
  let lastFood: Food | null = null;

  for (const option of validOptions) {
    accumulatedWeight += option.weight;
    lastFood = option.food;

    if (targetWeight < accumulatedWeight) {
      return option.food;
    }
  }

  return lastFood;
}

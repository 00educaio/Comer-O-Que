export type Food = {
  id: string;
  name: string;
  description: string | null;
  emoji: string | null;
  assetKey: string | null;
  searchQuery: string;
  tags: string[];
};

export type RouletteGroupFood = {
  food: Food;
  weight: number;
};

export type RouletteGroup = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  emoji: string | null;
  foods: RouletteGroupFood[];
};

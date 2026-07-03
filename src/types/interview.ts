import type { Food } from '@/types/catalog';

export type InterviewTagScore = {
  tag: string;
  points: number;
};

export type InterviewAnswerOption = {
  id: string;
  label: string;
  emoji: string;
  tagScores: InterviewTagScore[];
  requiredTags?: string[];
};

export type InterviewQuestion = {
  id: string;
  prompt: string;
  options: InterviewAnswerOption[];
};

export type InterviewAnswer = {
  questionId: string;
  optionId: string;
};

export type InterviewRecommendation = {
  food: Food;
  score: number;
};

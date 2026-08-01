export type DifficultyLevel =
  | 'low'
  | 'medium'
  | 'high'
  | 'unsure'
  | 'unfamiliar'
  | 'skipped';

export type PastDifficultyLevel =
  | DifficultyLevel
  | 'not-eaten-then'
  | 'dont-remember';

export interface FoodAssessment {
  foodId: string;
  current: DifficultyLevel | null;
  oneYearAgo: PastDifficultyLevel | null;
  updatedAt: string;
}

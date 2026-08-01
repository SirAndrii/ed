import type { FoodAssessment } from './assessment';
import type { FoodItem } from './food';
import type { CategoryProgress } from './category';

export interface AppStorage {
  schemaVersion: 1;
  assessments: Record<string, FoodAssessment>;
  customFoods: FoodItem[];
  categoryProgress: Record<string, CategoryProgress>;
  lastActiveCategoryId: string | null;
  /** Created the first time user enables the year-ago survey */
  pastSurveySession: {
    enabledAt: string;       // when user turned the feature on
    referenceDate: string;   // ≈ one year before enabledAt
  } | null;
  preferences: {
    reducedMotion: boolean;
    showStoreTags: boolean;
    reportName: string;
    enablePastSurvey: boolean;
  };
}

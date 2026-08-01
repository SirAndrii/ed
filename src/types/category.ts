export type CategoryStatus =
  | 'not-started'
  | 'in-progress'
  | 'completed'
  | 'partially-completed'
  | 'skipped';

export interface Category {
  id: string;
  nameUk: string;
  description: string;
  icon: string;
  isCustom?: boolean;
}

export interface CategoryProgress {
  categoryId: string;
  status: CategoryStatus;
  currentFoodIndex: number;
  assessedFoodIds: string[];
  completedAt: string | null;
}

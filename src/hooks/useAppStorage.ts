import { useState, useCallback } from 'react';
import type { AppStorage, FoodAssessment, CategoryProgress } from '../types';
import {
  loadAppStorage,
  saveAppStorage,
  resetAppStorage,
  exportAppStorage,
  importAppStorage,
  exportCategory,
  resetCategory,
} from '../features/storage/storageService';
import type { FoodItem } from '../types';

export function useAppStorage() {
  const [storage, setStorage] = useState<AppStorage>(() => loadAppStorage());

  const persist = useCallback((updated: AppStorage) => {
    saveAppStorage(updated);
    setStorage(updated);
  }, []);

  const setAssessment = useCallback(
    (assessment: FoodAssessment) => {
      const updated = {
        ...storage,
        assessments: {
          ...storage.assessments,
          [assessment.foodId]: assessment,
        },
      };
      persist(updated);
    },
    [storage, persist]
  );

  const setCategoryProgress = useCallback(
    (progress: CategoryProgress) => {
      const updated = {
        ...storage,
        categoryProgress: {
          ...storage.categoryProgress,
          [progress.categoryId]: progress,
        },
        lastActiveCategoryId: progress.categoryId,
      };
      persist(updated);
    },
    [storage, persist]
  );

  const addCustomFood = useCallback(
    (food: FoodItem) => {
      const updated = {
        ...storage,
        customFoods: [...storage.customFoods, food],
      };
      persist(updated);
    },
    [storage, persist]
  );

  const updatePreferences = useCallback(
    (prefs: Partial<AppStorage['preferences']>) => {
      const updated = {
        ...storage,
        preferences: { ...storage.preferences, ...prefs },
      };
      persist(updated);
    },
    [storage, persist]
  );

  const enablePastSurvey = useCallback(
    (enabled: boolean) => {
      const now = new Date();
      const oneYearAgo = new Date(now);
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const updated = {
        ...storage,
        pastSurveySession: enabled
          ? (storage.pastSurveySession ?? {
              enabledAt: now.toISOString(),
              referenceDate: oneYearAgo.toISOString(),
            })
          : null,
        preferences: { ...storage.preferences, enablePastSurvey: enabled },
      };
      persist(updated);
    },
    [storage, persist]
  );

  const handleReset = useCallback(() => {
    resetAppStorage();
    const fresh = loadAppStorage();
    setStorage(fresh);
  }, []);

  const handleExport = useCallback(() => {
    exportAppStorage();
  }, []);

  const handleImport = useCallback(
    async (file: File) => {
      const imported = await importAppStorage(file);
      setStorage(imported);
    },
    []
  );

  const handleExportCategory = useCallback((categoryId: string) => {
    exportCategory(categoryId);
  }, []);

  const handleResetCategory = useCallback(
    (categoryId: string, foodIds: string[]) => {
      resetCategory(categoryId, foodIds);
      const fresh = loadAppStorage();
      setStorage(fresh);
    },
    []
  );

  return {
    storage,
    setAssessment,
    setCategoryProgress,
    addCustomFood,
    updatePreferences,
    enablePastSurvey,
    handleReset,
    handleExport,
    handleImport,
    handleExportCategory,
    handleResetCategory,
  };
}

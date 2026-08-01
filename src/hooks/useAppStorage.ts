import { useState, useCallback, useRef } from 'react';
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
  const storageRef = useRef(storage);

  const persist = useCallback((update: (current: AppStorage) => AppStorage) => {
    const updated = update(storageRef.current);
    storageRef.current = updated;
    saveAppStorage(updated);
    setStorage(updated);
  }, []);

  const setAssessment = useCallback(
    (assessment: FoodAssessment) => {
      persist((current) => ({
        ...current,
        assessments: {
          ...current.assessments,
          [assessment.foodId]: assessment,
        },
      }));
    },
    [persist]
  );

  const setCategoryProgress = useCallback(
    (progress: CategoryProgress) => {
      persist((current) => {
        const savedProgress = current.categoryProgress[progress.categoryId];
        return {
          ...current,
          categoryProgress: {
            ...current.categoryProgress,
            [progress.categoryId]: {
              ...savedProgress,
              ...progress,
              assessedFoodIds: Array.from(new Set([
                ...(savedProgress?.assessedFoodIds ?? []),
                ...progress.assessedFoodIds,
              ])),
            },
          },
          lastActiveCategoryId: progress.categoryId,
        };
      });
    },
    [persist]
  );

  const addCustomFood = useCallback(
    (food: FoodItem) => {
      persist((current) => ({
        ...current,
        customFoods: [...current.customFoods, food],
      }));
    },
    [persist]
  );

  const updatePreferences = useCallback(
    (prefs: Partial<AppStorage['preferences']>) => {
      persist((current) => ({
        ...current,
        preferences: { ...current.preferences, ...prefs },
      }));
    },
    [persist]
  );

  const enablePastSurvey = useCallback(
    (enabled: boolean) => {
      const now = new Date();
      const oneYearAgo = new Date(now);
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      persist((current) => ({
        ...current,
        pastSurveySession: enabled
          ? (current.pastSurveySession ?? {
              enabledAt: now.toISOString(),
              referenceDate: oneYearAgo.toISOString(),
            })
          : null,
        preferences: { ...current.preferences, enablePastSurvey: enabled },
      }));
    },
    [persist]
  );

  const handleReset = useCallback(() => {
    resetAppStorage();
    const fresh = loadAppStorage();
    storageRef.current = fresh;
    setStorage(fresh);
  }, []);

  const handleExport = useCallback(() => {
    exportAppStorage();
  }, []);

  const handleImport = useCallback(
    async (file: File) => {
      const imported = await importAppStorage(file);
      storageRef.current = imported;
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
      storageRef.current = fresh;
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

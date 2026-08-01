import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { loadAppStorage } from '../features/storage/storageService';
import { useAppStorage } from '../hooks/useAppStorage';

describe('useAppStorage persistence', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('does not lose an assessment when category progress is saved immediately afterwards', () => {
    const { result, unmount } = renderHook(() => useAppStorage());

    act(() => {
      result.current.setAssessment({
        foodId: 'apple',
        current: 'low',
        oneYearAgo: null,
        updatedAt: '2026-08-01T00:00:00.000Z',
      });
      result.current.setCategoryProgress({
        categoryId: 'fruits',
        status: 'in-progress',
        currentFoodIndex: 1,
        assessedFoodIds: ['apple'],
        completedAt: null,
      });
    });

    expect(loadAppStorage().assessments.apple?.current).toBe('low');
    expect(loadAppStorage().categoryProgress.fruits?.assessedFoodIds).toContain('apple');

    unmount();
    const restored = renderHook(() => useAppStorage());
    expect(restored.result.current.storage.assessments.apple?.current).toBe('low');
  });
});

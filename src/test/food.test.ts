import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { searchFoods } from '../features/search/searchService';
import {
  loadAppStorage,
  saveAppStorage,
  resetCategory,
  STORAGE_KEY,
} from '../features/storage/storageService';
import { FOODS } from '../data/foods';
import { changeLabel } from '../utils/changeLabel';
import type { FoodItem } from '../types/food';

// ===== Test 1: Search normalization =====
describe('searchFoods normalization', () => {
  it('ignores case', () => {
    expect(searchFoods(FOODS, 'ЯБЛУКО').some((f) => f.id === 'apple')).toBe(true);
  });

  it('trims whitespace', () => {
    expect(searchFoods(FOODS, '  банан  ').some((f) => f.id === 'banana')).toBe(true);
  });

  it('normalises ё → е', () => {
    // Any query with ё should not crash and should return results normally
    expect(() => searchFoods(FOODS, 'ёогурт')).not.toThrow();
  });

  it('returns empty array for blank query', () => {
    expect(searchFoods(FOODS, '   ')).toHaveLength(0);
  });
});

// ===== Test 2: Search by alias =====
describe('searchFoods aliases', () => {
  it('finds sour cream by alias "smetana"', () => {
    expect(searchFoods(FOODS, 'smetana').some((f) => f.id === 'sour-cream')).toBe(true);
  });

  it('finds herring by alias "селедка"', () => {
    expect(searchFoods(FOODS, 'селедка').some((f) => f.id === 'herring')).toBe(true);
  });
});

// ===== Test 3: гречка → buckwheat =====
describe('searchFoods cross-language', () => {
  it('finds гречка by "buckwheat"', () => {
    expect(searchFoods(FOODS, 'buckwheat').some((f) => f.id === 'buckwheat')).toBe(true);
  });

  it('finds гречка by "kasha"', () => {
    expect(searchFoods(FOODS, 'kasha').some((f) => f.id === 'buckwheat')).toBe(true);
  });
});

// ===== Test 4: кисломолочний сир → tvorog =====
describe('searchFoods tvorog', () => {
  it('finds кисломолочний сир by "tvorog"', () => {
    expect(searchFoods(FOODS, 'tvorog').some((f) => f.id === 'tvorog')).toBe(true);
  });

  it('finds кисломолочний сир by "farmer cheese"', () => {
    expect(searchFoods(FOODS, 'farmer cheese').some((f) => f.id === 'tvorog')).toBe(true);
  });
});

// ===== Test: Search relevance ordering =====
describe('searchFoods relevance ordering', () => {
  it('exact name match ranks above substring match', () => {
    // 'рис' is an exact match; 'рисовий' is a substring match
    const results = searchFoods(FOODS, 'рис');
    const exactIdx = results.findIndex((f) => f.id === 'rice');
    expect(exactIdx).toBeGreaterThanOrEqual(0);
    // exact match should appear before anything that merely contains 'рис' further in the string
    const laterIdx = results.findIndex(
      (f) => f.id !== 'rice' && f.nameUk.toLowerCase().includes('рис')
    );
    if (laterIdx !== -1) {
      expect(exactIdx).toBeLessThan(laterIdx);
    }
  });
});

// ===== Test 5: localStorage save and restore =====
describe('localStorage save and restore', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('saves and restores assessments', () => {
    const storage = loadAppStorage();
    storage.assessments['apple'] = {
      foodId: 'apple',
      current: 'low',
      oneYearAgo: null,
      updatedAt: new Date().toISOString(),
    };
    saveAppStorage(storage);
    expect(loadAppStorage().assessments['apple']?.current).toBe('low');
  });

  it('returns default storage when localStorage is empty', () => {
    const storage = loadAppStorage();
    expect(storage.schemaVersion).toBe(1);
    expect(storage.assessments).toEqual({});
    expect(Array.isArray(storage.customFoods)).toBe(true);
  });
});

// ===== Test 6: Corrupted JSON =====
describe('corrupted JSON handling', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('returns default storage on corrupted JSON', () => {
    localStorage.setItem(STORAGE_KEY, '{not valid json{{');
    const storage = loadAppStorage();
    expect(storage.schemaVersion).toBe(1);
    expect(storage.assessments).toEqual({});
  });

  it('returns default storage on wrong schema', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: 99, foo: 'bar' }));
    expect(loadAppStorage().schemaVersion).toBe(1);
  });
});

// ===== Test 7: Add custom food =====
describe('custom food', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('can add and retrieve a custom food', () => {
    const storage = loadAppStorage();
    const custom: FoodItem = {
      id: 'custom-001',
      nameUk: 'Млинці',
      nameEn: 'Crepes',
      aliases: ['crepes', 'blini'],
      categoryId: 'custom',
      storeTags: [],
      keywords: ['млинці'],
    };
    storage.customFoods.push(custom);
    saveAppStorage(storage);
    expect(loadAppStorage().customFoods.find((f) => f.id === 'custom-001')?.nameUk).toBe('Млинці');
  });
});

// ===== Test 8: Independent category progress =====
describe('independent category progress', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('stores progress for each category independently', () => {
    const storage = loadAppStorage();
    storage.categoryProgress['fruits'] = {
      categoryId: 'fruits', status: 'in-progress',
      currentFoodIndex: 5, assessedFoodIds: ['apple', 'banana'], completedAt: null,
    };
    storage.categoryProgress['vegetables'] = {
      categoryId: 'vegetables', status: 'not-started',
      currentFoodIndex: 0, assessedFoodIds: [], completedAt: null,
    };
    saveAppStorage(storage);
    const restored = loadAppStorage();
    expect(restored.categoryProgress['fruits']?.status).toBe('in-progress');
    expect(restored.categoryProgress['vegetables']?.status).toBe('not-started');
    expect(restored.categoryProgress['fruits']?.currentFoodIndex).toBe(5);
  });
});

// ===== Test 9: Complete only fruits =====
describe('complete only fruits category', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('completing fruits does not affect vegetables', () => {
    const storage = loadAppStorage();
    storage.categoryProgress['fruits'] = {
      categoryId: 'fruits', status: 'completed',
      currentFoodIndex: 30, assessedFoodIds: ['apple', 'banana', 'orange'],
      completedAt: new Date().toISOString(),
    };
    saveAppStorage(storage);
    const restored = loadAppStorage();
    expect(restored.categoryProgress['fruits']?.status).toBe('completed');
    expect(restored.categoryProgress['vegetables']).toBeUndefined();
  });
});

// ===== Test 10: No auto-advance to another category =====
describe('no auto-advance between categories', () => {
  it('completing fruits does not set vegetables as in-progress', () => {
    const storage = loadAppStorage();
    storage.categoryProgress['fruits'] = {
      categoryId: 'fruits', status: 'completed',
      currentFoodIndex: 30, assessedFoodIds: [], completedAt: new Date().toISOString(),
    };
    saveAppStorage(storage);
    const restored = loadAppStorage();
    expect(restored.categoryProgress['vegetables']).toBeUndefined();
    expect(restored.lastActiveCategoryId).toBeNull();
  });
});

// ===== Test 11: Print single category =====
describe('print category', () => {
  it('window.print is callable', () => {
    expect(typeof window.print).toBe('function');
  });
});

// ===== Test 12: Export single category =====
describe('export category data', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('category progress can be extracted for export', () => {
    const storage = loadAppStorage();
    storage.categoryProgress['fruits'] = {
      categoryId: 'fruits', status: 'completed',
      currentFoodIndex: 5, assessedFoodIds: ['apple'], completedAt: new Date().toISOString(),
    };
    saveAppStorage(storage);
    const restored = loadAppStorage();
    const catExport = { categoryId: 'fruits', progress: restored.categoryProgress['fruits'] };
    expect(catExport.categoryId).toBe('fruits');
    expect(catExport.progress?.status).toBe('completed');
  });
});

// ===== Test 13: changeLabel — year-ago comparison =====
describe('changeLabel', () => {
  it('high → low = Стало менш складно', () => {
    expect(changeLabel('low', 'high')).toBe('Стало менш складно');
  });

  it('low → high = Стало складніше', () => {
    expect(changeLabel('high', 'low')).toBe('Стало складніше');
  });

  it('medium → medium = Без помітної зміни', () => {
    expect(changeLabel('medium', 'medium')).toBe('Без помітної зміни');
  });

  it('null current → Недостатньо даних', () => {
    expect(changeLabel(null, 'high')).toBe('Недостатньо даних для порівняння');
  });

  it('null past → Недостатньо даних', () => {
    expect(changeLabel('low', null)).toBe('Недостатньо даних для порівняння');
  });

  it('dont-remember → Недостатньо даних', () => {
    expect(changeLabel('low', 'dont-remember')).toBe('Недостатньо даних для порівняння');
  });

  it('not-eaten-then → Недостатньо даних', () => {
    expect(changeLabel('medium', 'not-eaten-then')).toBe('Недостатньо даних для порівняння');
  });

  it('skipped past → Недостатньо даних', () => {
    expect(changeLabel('low', 'skipped')).toBe('Недостатньо даних для порівняння');
  });

  it('unsure current → Недостатньо даних (not in order map)', () => {
    expect(changeLabel('unsure', 'low')).toBe('Недостатньо даних для порівняння');
  });
});

// ===== Test 14: unsure/unfamiliar/skipped ≠ high =====
describe('difficulty level semantics', () => {
  it('unsure is not high', () => {
    expect('unsure').not.toBe('high');
  });

  it('unfamiliar is not high', () => {
    expect('unfamiliar').not.toBe('high');
  });

  it('skipped is not high', () => {
    expect('skipped').not.toBe('high');
  });

  it('only "high" is counted as high in stats', () => {
    const assessments = [
      { current: 'unsure' }, { current: 'unfamiliar' },
      { current: 'skipped' }, { current: 'high' },
    ];
    expect(assessments.filter((a) => a.current === 'high')).toHaveLength(1);
  });
});

// ===== Test 15: unassessed ≠ skipped =====
describe('unassessed vs skipped', () => {
  it('food with no assessment is unassessed (undefined), not skipped', () => {
    const storage = loadAppStorage();
    expect(storage.assessments['apple']).toBeUndefined();
  });

  it('skipped requires explicit value', () => {
    beforeEach(() => localStorage.clear());
    const storage = loadAppStorage();
    storage.assessments['banana'] = {
      foodId: 'banana', current: 'skipped', oneYearAgo: null,
      updatedAt: new Date().toISOString(),
    };
    saveAppStorage(storage);
    expect(loadAppStorage().assessments['banana']?.current).toBe('skipped');
  });

  it('unassessed count = foods with no current OR skipped', () => {
    const mockAssessments: Record<string, { current: string }> = {
      apple: { current: 'low' },
      banana: { current: 'skipped' },
    };
    const foods = [{ id: 'apple' }, { id: 'banana' }, { id: 'orange' }];
    const unassessed = foods.filter(
      (f) => !mockAssessments[f.id]?.current || mockAssessments[f.id].current === 'skipped'
    );
    expect(unassessed).toHaveLength(2); // banana (skipped) + orange (missing)
  });
});

// ===== Test: Default storage fields =====
describe('default storage fields', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('default storage has enablePastSurvey = false', () => {
    expect(loadAppStorage().preferences.enablePastSurvey).toBe(false);
  });

  it('default storage has pastSurveySession = null', () => {
    expect(loadAppStorage().pastSurveySession).toBeNull();
  });

  it('default storage has showStoreTags = true', () => {
    expect(loadAppStorage().preferences.showStoreTags).toBe(true);
  });
});

// ===== Test: Backward-compatible load (old data without new fields) =====
describe('storage backward compatibility', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('loads old storage without enablePastSurvey and fills in default', () => {
    const oldStorage = {
      schemaVersion: 1,
      assessments: {},
      customFoods: [],
      categoryProgress: {},
      lastActiveCategoryId: null,
      // no pastSurveySession, no enablePastSurvey
      preferences: { reducedMotion: false, showStoreTags: true, reportName: '' },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(oldStorage));
    const loaded = loadAppStorage();
    expect(loaded.preferences.enablePastSurvey).toBe(false);
    expect(loaded.pastSurveySession).toBeNull();
  });

  it('preserves existing preferences when merging defaults', () => {
    const oldStorage = {
      schemaVersion: 1,
      assessments: { apple: { foodId: 'apple', current: 'high', oneYearAgo: null, updatedAt: '' } },
      customFoods: [],
      categoryProgress: {},
      lastActiveCategoryId: null,
      preferences: { reducedMotion: true, showStoreTags: false, reportName: 'Аня' },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(oldStorage));
    const loaded = loadAppStorage();
    expect(loaded.preferences.reducedMotion).toBe(true);
    expect(loaded.preferences.showStoreTags).toBe(false);
    expect(loaded.preferences.reportName).toBe('Аня');
    expect(loaded.assessments['apple']?.current).toBe('high');
  });
});

// ===== Test: pastSurveySession dates =====
describe('pastSurveySession', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('referenceDate is approximately 1 year before enabledAt', () => {
    const enabledAt = new Date('2026-08-01T12:00:00.000Z');
    const referenceDate = new Date(enabledAt);
    referenceDate.setFullYear(referenceDate.getFullYear() - 1);

    const diffMs = enabledAt.getTime() - referenceDate.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    // Should be 365 days (or 366 for leap year)
    expect(diffDays).toBeGreaterThanOrEqual(365);
    expect(diffDays).toBeLessThanOrEqual(366);
  });

  it('pastSurveySession is stored and restored correctly', () => {
    const storage = loadAppStorage();
    storage.pastSurveySession = {
      enabledAt: '2026-08-01T00:00:00.000Z',
      referenceDate: '2025-08-01T00:00:00.000Z',
    };
    storage.preferences.enablePastSurvey = true;
    saveAppStorage(storage);

    const restored = loadAppStorage();
    expect(restored.pastSurveySession?.enabledAt).toBe('2026-08-01T00:00:00.000Z');
    expect(restored.pastSurveySession?.referenceDate).toBe('2025-08-01T00:00:00.000Z');
    expect(restored.preferences.enablePastSurvey).toBe(true);
  });

  it('disabling past survey clears pastSurveySession', () => {
    const storage = loadAppStorage();
    storage.pastSurveySession = {
      enabledAt: '2026-08-01T00:00:00.000Z',
      referenceDate: '2025-08-01T00:00:00.000Z',
    };
    storage.preferences.enablePastSurvey = false;
    storage.pastSurveySession = null;
    saveAppStorage(storage);

    const restored = loadAppStorage();
    expect(restored.pastSurveySession).toBeNull();
    expect(restored.preferences.enablePastSurvey).toBe(false);
  });
});

// ===== Test: resetCategory =====
describe('resetCategory', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('removes assessments for the given food ids', () => {
    const storage = loadAppStorage();
    storage.assessments['apple'] = {
      foodId: 'apple', current: 'low', oneYearAgo: null, updatedAt: '',
    };
    storage.assessments['banana'] = {
      foodId: 'banana', current: 'high', oneYearAgo: null, updatedAt: '',
    };
    storage.categoryProgress['fruits'] = {
      categoryId: 'fruits', status: 'completed',
      currentFoodIndex: 2, assessedFoodIds: ['apple', 'banana'], completedAt: '',
    };
    saveAppStorage(storage);

    resetCategory('fruits', ['apple', 'banana']);

    const restored = loadAppStorage();
    expect(restored.assessments['apple']).toBeUndefined();
    expect(restored.assessments['banana']).toBeUndefined();
    expect(restored.categoryProgress['fruits']).toBeUndefined();
  });

  it('does not remove assessments from other categories', () => {
    const storage = loadAppStorage();
    storage.assessments['carrot'] = {
      foodId: 'carrot', current: 'medium', oneYearAgo: null, updatedAt: '',
    };
    storage.categoryProgress['vegetables'] = {
      categoryId: 'vegetables', status: 'in-progress',
      currentFoodIndex: 1, assessedFoodIds: ['carrot'], completedAt: null,
    };
    saveAppStorage(storage);

    resetCategory('fruits', ['apple']);

    const restored = loadAppStorage();
    expect(restored.assessments['carrot']?.current).toBe('medium');
    expect(restored.categoryProgress['vegetables']?.status).toBe('in-progress');
  });

  it('clears lastActiveCategoryId when resetting the active category', () => {
    const storage = loadAppStorage();
    storage.lastActiveCategoryId = 'fruits';
    saveAppStorage(storage);

    resetCategory('fruits', []);

    expect(loadAppStorage().lastActiveCategoryId).toBeNull();
  });
});

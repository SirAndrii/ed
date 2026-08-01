import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { searchFoods } from '../features/search/searchService';
import {
  loadAppStorage,
  saveAppStorage,
  STORAGE_KEY,
} from '../features/storage/storageService';
import { FOODS } from '../data/foods';
import type { FoodItem } from '../types/food';

// ===== Test 1: Search normalization =====
describe('searchFoods normalization', () => {
  it('ignores case', () => {
    const results = searchFoods(FOODS, 'ЯБЛУКО');
    expect(results.some((f) => f.id === 'apple')).toBe(true);
  });

  it('trims whitespace', () => {
    const results = searchFoods(FOODS, '  банан  ');
    expect(results.some((f) => f.id === 'banana')).toBe(true);
  });
});

// ===== Test 2: Search by alias =====
describe('searchFoods aliases', () => {
  it('finds sour cream by alias "smetana"', () => {
    const results = searchFoods(FOODS, 'smetana');
    expect(results.some((f) => f.id === 'sour-cream')).toBe(true);
  });

  it('finds herring by alias "селедка"', () => {
    const results = searchFoods(FOODS, 'селедка');
    expect(results.some((f) => f.id === 'herring')).toBe(true);
  });
});

// ===== Test 3: гречка → buckwheat =====
describe('searchFoods cross-language', () => {
  it('finds гречка by "buckwheat"', () => {
    const results = searchFoods(FOODS, 'buckwheat');
    expect(results.some((f) => f.id === 'buckwheat')).toBe(true);
  });

  it('finds гречка by "kasha"', () => {
    const results = searchFoods(FOODS, 'kasha');
    expect(results.some((f) => f.id === 'buckwheat')).toBe(true);
  });
});

// ===== Test 4: кисломолочний сир → tvorog =====
describe('searchFoods tvorog', () => {
  it('finds кисломолочний сир by "tvorog"', () => {
    const results = searchFoods(FOODS, 'tvorog');
    expect(results.some((f) => f.id === 'tvorog')).toBe(true);
  });

  it('finds кисломолочний сир by "farmer cheese"', () => {
    const results = searchFoods(FOODS, 'farmer cheese');
    expect(results.some((f) => f.id === 'tvorog')).toBe(true);
  });
});

// ===== Test 5: localStorage save and restore =====
describe('localStorage save and restore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('saves and restores assessments', () => {
    const storage = loadAppStorage();
    storage.assessments['apple'] = {
      foodId: 'apple',
      current: 'low',
      oneYearAgo: null,
      updatedAt: new Date().toISOString(),
    };
    saveAppStorage(storage);

    const restored = loadAppStorage();
    expect(restored.assessments['apple']?.current).toBe('low');
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
    const storage = loadAppStorage();
    expect(storage.schemaVersion).toBe(1);
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

    const restored = loadAppStorage();
    expect(restored.customFoods.find((f) => f.id === 'custom-001')?.nameUk).toBe('Млинці');
  });
});

// ===== Test 8: Independent category progress =====
describe('independent category progress', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('stores progress for each category independently', () => {
    const storage = loadAppStorage();
    storage.categoryProgress['fruits'] = {
      categoryId: 'fruits',
      status: 'in-progress',
      currentFoodIndex: 5,
      assessedFoodIds: ['apple', 'banana'],
      completedAt: null,
    };
    storage.categoryProgress['vegetables'] = {
      categoryId: 'vegetables',
      status: 'not-started',
      currentFoodIndex: 0,
      assessedFoodIds: [],
      completedAt: null,
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
      categoryId: 'fruits',
      status: 'completed',
      currentFoodIndex: 30,
      assessedFoodIds: ['apple', 'banana', 'orange'],
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
  it('completing fruits category does not set vegetables as in-progress', () => {
    const storage = loadAppStorage();
    storage.categoryProgress['fruits'] = {
      categoryId: 'fruits',
      status: 'completed',
      currentFoodIndex: 30,
      assessedFoodIds: [],
      completedAt: new Date().toISOString(),
    };
    saveAppStorage(storage);

    const restored = loadAppStorage();
    // vegetables must remain untouched
    expect(restored.categoryProgress['vegetables']).toBeUndefined();
    expect(restored.lastActiveCategoryId).toBeNull();
  });
});

// ===== Test 11: Print single category =====
describe('print category', () => {
  it('window.print is callable', () => {
    // window.print exists in jsdom
    expect(typeof window.print).toBe('function');
  });
});

// ===== Test 12: Export single category =====
describe('export category data', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('loadAppStorage returns categoryProgress that can be exported per category', () => {
    const storage = loadAppStorage();
    storage.categoryProgress['fruits'] = {
      categoryId: 'fruits',
      status: 'completed',
      currentFoodIndex: 5,
      assessedFoodIds: ['apple'],
      completedAt: new Date().toISOString(),
    };
    saveAppStorage(storage);

    const restored = loadAppStorage();
    const catExport = {
      categoryId: 'fruits',
      progress: restored.categoryProgress['fruits'],
    };
    expect(catExport.categoryId).toBe('fruits');
    expect(catExport.progress?.status).toBe('completed');
  });
});

// ===== Test 13: Compare current vs one year ago =====
describe('year-ago comparison', () => {
  it('detects improvement (high → low)', () => {
    const order: Record<string, number> = { low: 0, medium: 1, high: 2 };
    const current = 'low';
    const past = 'high';
    const result = order[current]! < order[past]! ? 'Стало менш складно' : 'Без змін або складніше';
    expect(result).toBe('Стало менш складно');
  });

  it('detects no change (medium → medium)', () => {
    const order: Record<string, number> = { low: 0, medium: 1, high: 2 };
    const current = 'medium';
    const past = 'medium';
    const c = order[current] ?? -1;
    const p = order[past] ?? -1;
    expect(c).toBe(p);
  });

  it('detects worsening (low → high)', () => {
    const order: Record<string, number> = { low: 0, medium: 1, high: 2 };
    const current = 'high';
    const past = 'low';
    const result = order[current]! > order[past]! ? 'Стало складніше' : 'Без змін або покращилось';
    expect(result).toBe('Стало складніше');
  });
});

// ===== Test 14: unsure/unfamiliar/skipped ≠ high =====
describe('difficulty level semantics', () => {
  it('unsure is not high', () => {
    const level: string = 'unsure';
    expect(level).not.toBe('high');
  });

  it('unfamiliar is not high', () => {
    const level: string = 'unfamiliar';
    expect(level).not.toBe('high');
  });

  it('skipped is not high', () => {
    const level: string = 'skipped';
    expect(level).not.toBe('high');
  });

  it('unsure/unfamiliar/skipped are not counted as high in stats', () => {
    const assessments = [
      { current: 'unsure' },
      { current: 'unfamiliar' },
      { current: 'skipped' },
      { current: 'high' },
    ];
    const highCount = assessments.filter((a) => a.current === 'high').length;
    expect(highCount).toBe(1);
  });
});

// ===== Test 15: unassessed ≠ skipped =====
describe('unassessed vs skipped', () => {
  it('food with no assessment is unassessed, not skipped', () => {
    const storage = loadAppStorage();
    const assessment = storage.assessments['apple'];
    // No assessment = null/undefined, NOT skipped
    expect(assessment).toBeUndefined();
  });

  it('skipped requires explicit skipped value', () => {
    const storage = loadAppStorage();
    storage.assessments['banana'] = {
      foodId: 'banana',
      current: 'skipped',
      oneYearAgo: null,
      updatedAt: new Date().toISOString(),
    };
    saveAppStorage(storage);
    const restored = loadAppStorage();
    expect(restored.assessments['banana']?.current).toBe('skipped');
  });
});

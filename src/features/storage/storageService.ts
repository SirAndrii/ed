import type { AppStorage } from '../../types';

export const STORAGE_KEY = 'food-assessment-v1';

const DEFAULT_STORAGE: AppStorage = {
  schemaVersion: 1,
  assessments: {},
  customFoods: [],
  categoryProgress: {},
  lastActiveCategoryId: null,
  preferences: {
    reducedMotion: false,
    showStoreTags: true,
    reportName: '',
  },
};

export function loadAppStorage(): AppStorage {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STORAGE };
    const parsed: unknown = JSON.parse(raw);
    if (!isValidStorage(parsed)) return { ...DEFAULT_STORAGE };
    return parsed as AppStorage;
  } catch {
    return { ...DEFAULT_STORAGE };
  }
}

export function saveAppStorage(data: AppStorage): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage might be full or unavailable
  }
}

export function resetAppStorage(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function exportAppStorage(): void {
  const data = loadAppStorage();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `food-assessment-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importAppStorage(file: File): Promise<AppStorage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed: unknown = JSON.parse(text);
        if (!isValidStorage(parsed)) {
          reject(new Error('Недійсний формат файлу'));
          return;
        }
        saveAppStorage(parsed as AppStorage);
        resolve(parsed as AppStorage);
      } catch {
        reject(new Error('Не вдалося прочитати файл'));
      }
    };
    reader.onerror = () => reject(new Error('Помилка читання файлу'));
    reader.readAsText(file);
  });
}

export function exportCategory(categoryId: string): void {
  const data = loadAppStorage();
  const categoryExport = {
    categoryId,
    assessments: Object.fromEntries(
      Object.entries(data.assessments).filter(([, v]) => {
        // We need food data to filter by category, so export all assessments for category
        // The consumer will filter; for now export with categoryId marker
        return true;
      })
    ),
    categoryProgress: data.categoryProgress[categoryId] ?? null,
    exportedAt: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(categoryExport, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `food-assessment-category-${categoryId}-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function resetCategory(categoryId: string, foodIds: string[]): void {
  const data = loadAppStorage();
  foodIds.forEach((id) => {
    delete data.assessments[id];
  });
  delete data.categoryProgress[categoryId];
  if (data.lastActiveCategoryId === categoryId) {
    data.lastActiveCategoryId = null;
  }
  saveAppStorage(data);
}

function isValidStorage(data: unknown): boolean {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as Record<string, unknown>;
  return (
    d.schemaVersion === 1 &&
    typeof d.assessments === 'object' &&
    Array.isArray(d.customFoods) &&
    typeof d.categoryProgress === 'object'
  );
}

import type { FoodItem } from '../../types';

function normalize(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/ё/g, 'е')
    .replace(/й/g, 'й');
}

function score(food: FoodItem, query: string): number {
  const q = normalize(query);
  const nameUk = normalize(food.nameUk);
  const nameEn = normalize(food.nameEn);
  const aliases = food.aliases.map(normalize);
  const keywords = food.keywords.map(normalize);

  if (nameUk === q || nameEn === q) return 100;
  if (aliases.some((a) => a === q)) return 90;
  if (nameUk.startsWith(q) || nameEn.startsWith(q)) return 80;
  if (aliases.some((a) => a.startsWith(q))) return 70;
  if (nameUk.includes(q) || nameEn.includes(q)) return 60;
  if (aliases.some((a) => a.includes(q))) return 50;
  if (keywords.some((k) => k.includes(q))) return 40;
  return 0;
}

export function searchFoods(foods: FoodItem[], query: string): FoodItem[] {
  if (!query.trim()) return [];
  const results = foods
    .map((f) => ({ food: f, score: score(f, query) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);
  return results.map((r) => r.food);
}

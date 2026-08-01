import { useState, useCallback } from 'react';
import type { FoodItem, FoodAssessment } from '../types';
import { searchFoods } from '../features/search';
import { getCategoryById } from '../data';
import { StoreTags } from './StoreTags';
import styles from './FoodSearch.module.css';

const DIFFICULTY_LABELS: Record<string, string> = {
  low: 'Низька',
  medium: 'Середня',
  high: 'Висока',
  unsure: 'Не знаю',
  unfamiliar: 'Не знайома',
  skipped: 'Пропущено',
};

interface Props {
  foods: FoodItem[];
  assessments: Record<string, FoodAssessment>;
  showStoreTags: boolean;
  onAssess: (food: FoodItem) => void;
  onGoToCategory: (categoryId: string) => void;
  onAddCustom: (query: string) => void;
}

export function FoodSearch({
  foods,
  assessments,
  showStoreTags,
  onAssess,
  onGoToCategory,
  onAddCustom,
}: Props) {
  const [query, setQuery] = useState('');
  const results = query.trim().length >= 2 ? searchFoods(foods, query) : [];

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  }, []);

  return (
    <div className={styles.wrapper}>
      <div className={styles.inputWrapper}>
        <label htmlFor="food-search" className={styles.label}>
          Пошук продукту
        </label>
        <input
          id="food-search"
          type="search"
          value={query}
          onChange={handleChange}
          placeholder="Гречка, buckwheat, творог…"
          className={styles.input}
          autoComplete="off"
          aria-label="Пошук продукту"
        />
      </div>

      {query.trim().length >= 2 && (
        <div className={styles.results} aria-live="polite" aria-label="Результати пошуку">
          {results.length === 0 ? (
            <div className={styles.notFound}>
              <p>Нічого не знайдено.</p>
              <button
                className={styles.btnAdd}
                onClick={() => onAddCustom(query)}
                aria-label={`Додати "${query}" як свій продукт`}
              >
                + Додати «{query}» як свій продукт
              </button>
            </div>
          ) : (
            <ul className={styles.list} role="list">
              {results.map((food) => {
                const assessment = assessments[food.id];
                const category = getCategoryById(food.categoryId);
                return (
                  <li key={food.id} className={styles.item}>
                    <div className={styles.itemInfo}>
                      <span className={styles.itemNameUk}>{food.nameUk}</span>
                      <span className={styles.itemNameEn}>{food.nameEn}</span>
                      {category && (
                        <span className={styles.itemCategory}>{category.nameUk}</span>
                      )}
                      {showStoreTags && <StoreTags tags={food.storeTags} />}
                      {assessment?.current && (
                        <span className={styles.itemAssessment}>
                          Оцінка: {DIFFICULTY_LABELS[assessment.current] ?? assessment.current}
                        </span>
                      )}
                    </div>
                    <div className={styles.itemActions}>
                      <button
                        className={styles.btnSmall}
                        onClick={() => onAssess(food)}
                        aria-label={`Оцінити ${food.nameUk}`}
                      >
                        Оцінити
                      </button>
                      {category && (
                        <button
                          className={styles.btnSmallGhost}
                          onClick={() => onGoToCategory(food.categoryId)}
                          aria-label={`Перейти до категорії ${category.nameUk}`}
                        >
                          До категорії
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

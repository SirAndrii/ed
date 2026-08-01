import { useState } from 'react';
import { useParams } from 'react-router-dom';
import type { NavigateFunction } from 'react-router-dom';
import type { DifficultyLevel } from '../types';
import { FOODS, getCategoryById } from '../data';
import type { useAppStorage } from '../hooks/useAppStorage';
import styles from './CategoryResultsPage.module.css';

const DIFFICULTY_LABELS: Record<string, string> = {
  low: 'Низька складність',
  medium: 'Середня складність',
  high: 'Висока складність',
  unsure: 'Не знаю',
  unfamiliar: 'Не знайома',
  skipped: 'Пропущено',
};

const PAST_LABELS: Record<string, string> = {
  low: 'Низька',
  medium: 'Середня',
  high: 'Висока',
  unsure: 'Не знаю',
  unfamiliar: 'Не знайома',
  skipped: 'Пропущено',
  'not-eaten-then': 'Не їла',
  'dont-remember': 'Не пам\'ятаю',
};

function changeLabel(current: string | null, past: string | null): string {
  if (!current || !past || past === 'dont-remember' || past === 'not-eaten-then' || past === 'skipped') {
    return 'Недостатньо даних для порівняння';
  }
  const order: Record<string, number> = { low: 0, medium: 1, high: 2 };
  const c = order[current] ?? -1;
  const p = order[past] ?? -1;
  if (c === -1 || p === -1) return 'Недостатньо даних для порівняння';
  if (c < p) return 'Стало менш складно';
  if (c > p) return 'Стало складніше';
  return 'Без помітної зміни';
}

type Filter = 'all' | DifficultyLevel | 'unassessed';

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Усі' },
  { value: 'low', label: 'Низька' },
  { value: 'medium', label: 'Середня' },
  { value: 'high', label: 'Висока' },
  { value: 'unsure', label: 'Не визначено' },
  { value: 'unassessed', label: 'Не оцінено' },
];

interface Props {
  storageHook: ReturnType<typeof useAppStorage>;
  mode: 'complete' | 'results';
  onNavigate: NavigateFunction;
}

export function CategoryResultsPage({ storageHook, mode, onNavigate }: Props) {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { storage, handleExportCategory } = storageHook;
  const [filter, setFilter] = useState<Filter>('all');

  const category = getCategoryById(categoryId ?? '');
  const foods = categoryId
    ? [...FOODS.filter((f) => f.categoryId === categoryId), ...storage.customFoods.filter((f) => f.categoryId === categoryId)]
    : [];

  if (!category || !categoryId) {
    return <p>Категорію не знайдено.</p>;
  }

  const assessedCount = foods.filter((f) => {
    const a = storage.assessments[f.id];
    return a?.current && a.current !== 'skipped';
  }).length;

  const counts = {
    low: foods.filter((f) => storage.assessments[f.id]?.current === 'low').length,
    medium: foods.filter((f) => storage.assessments[f.id]?.current === 'medium').length,
    high: foods.filter((f) => storage.assessments[f.id]?.current === 'high').length,
    unsure: foods.filter((f) => storage.assessments[f.id]?.current === 'unsure').length,
    unassessed: foods.filter((f) => !storage.assessments[f.id]?.current || storage.assessments[f.id]?.current === 'skipped').length,
  };

  const filtered = foods.filter((f) => {
    if (filter === 'all') return true;
    if (filter === 'unassessed') return !storage.assessments[f.id]?.current || storage.assessments[f.id]?.current === 'skipped';
    return storage.assessments[f.id]?.current === filter;
  });

  const reportName = storage.preferences.reportName;
  const printDate = new Date().toLocaleDateString('uk-UA');

  return (
    <div className={styles.wrapper}>
      {/* Print header */}
      <div className={`${styles.printHeader} print-report`}>
        <p style={{ display: 'none' }} className="print-only">
          Дата: {printDate}{reportName ? ` · ${reportName}` : ''}
        </p>
      </div>

      <h1 className="page-title">{category.nameUk}</h1>

      {mode === 'complete' && (
        <p className={styles.completeBadge} role="status">
          Категорію завершено ✓
        </p>
      )}

      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statNum}>{assessedCount}</span>
          <span className={styles.statLabel}>Оцінено</span>
        </div>
        <div className={`${styles.statItem} ${styles.low}`}>
          <span className={styles.statNum}>{counts.low}</span>
          <span className={styles.statLabel}>Низька</span>
        </div>
        <div className={`${styles.statItem} ${styles.medium}`}>
          <span className={styles.statNum}>{counts.medium}</span>
          <span className={styles.statLabel}>Середня</span>
        </div>
        <div className={`${styles.statItem} ${styles.high}`}>
          <span className={styles.statNum}>{counts.high}</span>
          <span className={styles.statLabel}>Висока</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNum}>{counts.unsure}</span>
          <span className={styles.statLabel}>Не знаю</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNum}>{counts.unassessed}</span>
          <span className={styles.statLabel}>Не оцінено</span>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters} role="group" aria-label="Фільтр за складністю">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            className={`${styles.filterBtn} ${filter === f.value ? styles.filterActive : ''}`}
            onClick={() => setFilter(f.value)}
            aria-pressed={filter === f.value}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Food list */}
      <ul className={styles.list} role="list">
        {filtered.map((food) => {
          const a = storage.assessments[food.id];
          const change = changeLabel(a?.current ?? null, a?.oneYearAgo?.toString() ?? null);
          return (
            <li key={food.id} className={`${styles.item} print-item`}>
              <div className={styles.itemMain}>
                <span className={styles.itemName}>{food.nameUk}</span>
                <span className={styles.itemEn}>{food.nameEn}</span>
              </div>
              <div className={styles.itemMeta}>
                {a?.current && (
                  <span className={`${styles.badge} ${styles[a.current]}`}>
                    {DIFFICULTY_LABELS[a.current]}
                  </span>
                )}
                {a?.oneYearAgo && (
                  <span className={styles.past}>
                    Рік тому: {PAST_LABELS[a.oneYearAgo]}
                  </span>
                )}
                {a?.current && a?.oneYearAgo && (
                  <span className={styles.change}>{change}</span>
                )}
              </div>
              <button
                className={styles.editBtn}
                onClick={() => onNavigate(`/assess/${categoryId}`)}
                aria-label={`Змінити оцінку для ${food.nameUk}`}
              >
                Змінити
              </button>
            </li>
          );
        })}
      </ul>

      {/* Actions */}
      <div className={`${styles.actions} no-print`}>
        <button className="btn-secondary" onClick={() => window.print()}>
          Роздрукувати цю категорію
        </button>
        <button className="btn-secondary" onClick={() => handleExportCategory(categoryId)}>
          Експортувати цю категорію
        </button>
        <button className="btn-secondary" onClick={() => onNavigate('/categories')}>
          Повернутися до категорій
        </button>
      </div>

      {/* Print legend */}
      <div className="print-legend" style={{ display: 'none' }}>
        <p>Легенда: Н — Низька складність · С — Середня · В — Висока · ? — Не знаю · ✗ — Не оцінено</p>
      </div>
    </div>
  );
}

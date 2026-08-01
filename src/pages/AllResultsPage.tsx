import { useState } from 'react';
import type { AppStorage } from '../types';
import type { NavigateFunction } from 'react-router-dom';
import { CATEGORIES, FOODS } from '../data';
import styles from './AllResultsPage.module.css';

const STATUS_LABELS: Record<string, string> = {
  'not-started': 'Не розпочато',
  'in-progress': 'У процесі',
  completed: 'Оцінено',
  'partially-completed': 'Частково оцінено',
  skipped: 'Пропущено',
};

const GROUPS = [
  { key: 'low'    as const, label: 'Безпечні',  emoji: '✅' },
  { key: 'medium' as const, label: 'Середні',   emoji: '🟡' },
  { key: 'high'   as const, label: 'Складні',   emoji: '🔴' },
];

interface Props {
  storage: AppStorage;
  onNavigate: NavigateFunction;
}

export function AllResultsPage({ storage, onNavigate }: Props) {
  const [view, setView] = useState<'categories' | 'difficulty'>('categories');

  const categoriesWithProgress = CATEGORIES.map((cat) => ({
    ...cat,
    progress: storage.categoryProgress[cat.id],
  }));

  const hasAny = categoriesWithProgress.some((c) => c.progress);

  // All foods (base + custom)
  const allFoods = [...FOODS, ...storage.customFoods];

  // Category name lookup
  const catName = (id: string) => CATEGORIES.find((c) => c.id === id)?.nameUk ?? id;

  return (
    <div>
      <h1 className="page-title">Результати</h1>
      <p className="page-subtitle">Не обов'язково проходити всі категорії.</p>

      {/* View toggle */}
      <div className={styles.viewToggle} role="group" aria-label="Вигляд">
        <button
          className={`${styles.viewBtn2} ${view === 'categories' ? styles.viewActive : ''}`}
          onClick={() => setView('categories')}
          aria-pressed={view === 'categories'}
        >
          За категоріями
        </button>
        <button
          className={`${styles.viewBtn2} ${view === 'difficulty' ? styles.viewActive : ''}`}
          onClick={() => setView('difficulty')}
          aria-pressed={view === 'difficulty'}
        >
          За складністю
        </button>
      </div>

      {/* ── CATEGORIES VIEW ── */}
      {view === 'categories' && (
        <>
          {!hasAny && (
            <div className={styles.empty}>
              <p>Ще немає оцінених продуктів.</p>
              <button className="btn-primary" onClick={() => onNavigate('/categories')}>
                Обрати категорію
              </button>
            </div>
          )}
          <ul className={styles.list} role="list">
            {categoriesWithProgress.map((cat) => {
              const status = cat.progress?.status ?? 'not-started';
              return (
                <li key={cat.id} className={styles.item}>
                  <span className={styles.icon} aria-hidden="true">{cat.icon}</span>
                  <span className={styles.name}>{cat.nameUk}</span>
                  <span className={`${styles.status} ${styles[status.replace('-', '_')]}`}>
                    {STATUS_LABELS[status]}
                  </span>
                  <button
                    className={styles.viewBtn}
                    onClick={() => onNavigate(`/results/${cat.id}`)}
                    aria-label={`Переглянути результати: ${cat.nameUk}`}
                  >
                    Переглянути
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {/* ── DIFFICULTY VIEW ── */}
      {view === 'difficulty' && (
        <div className={styles.groups}>
          {GROUPS.map(({ key, label, emoji }) => {
            const groupFoods = allFoods.filter(
              (f) => storage.assessments[f.id]?.current === key
            );
            return (
              <section key={key} className={`${styles.group} ${styles[key]}`} aria-label={label}>
                <h2 className={styles.groupTitle}>
                  <span aria-hidden="true">{emoji}</span>
                  {label}
                  <span className={styles.groupCount}>{groupFoods.length}</span>
                </h2>
                {groupFoods.length === 0 ? (
                  <p className={styles.groupEmpty}>Немає продуктів</p>
                ) : (
                  <ul className={styles.groupList} role="list">
                    {groupFoods.map((food) => (
                      <li key={food.id} className={styles.groupItem}>
                        <span className={styles.groupItemName}>{food.nameUk}</span>
                        {food.nameEn && food.nameEn !== food.nameUk && (
                          <span className={styles.groupItemEn}>{food.nameEn}</span>
                        )}
                        <button
                          className={styles.groupItemLink}
                          onClick={() => onNavigate(`/results/${food.categoryId}`)}
                          aria-label={`Відкрити категорію ${catName(food.categoryId)}`}
                        >
                          {catName(food.categoryId)}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}

          {!hasAny && (
            <div className={styles.empty}>
              <p>Ще немає оцінених продуктів.</p>
              <button className="btn-primary" onClick={() => onNavigate('/categories')}>
                Обрати категорію
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

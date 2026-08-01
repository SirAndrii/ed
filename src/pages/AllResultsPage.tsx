import type { AppStorage } from '../types';
import type { NavigateFunction } from 'react-router-dom';
import { CATEGORIES } from '../data';
import styles from './AllResultsPage.module.css';

const STATUS_LABELS: Record<string, string> = {
  'not-started': 'Не розпочато',
  'in-progress': 'У процесі',
  completed: 'Оцінено',
  'partially-completed': 'Частково оцінено',
  skipped: 'Пропущено',
};

interface Props {
  storage: AppStorage;
  onNavigate: NavigateFunction;
}

export function AllResultsPage({ storage, onNavigate }: Props) {
  const categoriesWithProgress = CATEGORIES.map((cat) => ({
    ...cat,
    progress: storage.categoryProgress[cat.id],
  }));

  const hasAny = categoriesWithProgress.some((c) => c.progress);

  return (
    <div>
      <h1 className="page-title">Результати</h1>
      <p className="page-subtitle">
        Не обов'язково проходити всі категорії.
      </p>

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
          const hasResults = status !== 'not-started';
          return (
            <li key={cat.id} className={styles.item}>
              <span className={styles.icon} aria-hidden="true">{cat.icon}</span>
              <span className={styles.name}>{cat.nameUk}</span>
              <span className={`${styles.status} ${styles[status.replace('-', '_')]}`}>
                {STATUS_LABELS[status]}
              </span>
              {hasResults && (
                <button
                  className={styles.viewBtn}
                  onClick={() => onNavigate(`/results/${cat.id}`)}
                  aria-label={`Переглянути результати: ${cat.nameUk}`}
                >
                  Переглянути
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

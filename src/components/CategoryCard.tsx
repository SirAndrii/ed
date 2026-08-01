import type { Category, CategoryProgress } from '../types';
import styles from './CategoryCard.module.css';
import { getFoodsByCategory } from '../data';

const STATUS_LABELS: Record<string, string> = {
  'not-started': 'Не розпочато',
  'in-progress': 'У процесі',
  completed: 'Оцінено',
  'partially-completed': 'Частково оцінено',
  skipped: 'Пропущено',
};

interface Props {
  category: Category;
  progress?: CategoryProgress;
  onSelect: (categoryId: string) => void;
}

export function CategoryCard({ category, progress, onSelect }: Props) {
  const foods = getFoodsByCategory(category.id);
  const total = foods.length;
  const assessed = progress?.assessedFoodIds.length ?? 0;
  const status = progress?.status ?? 'not-started';

  return (
    <article className={`${styles.card} ${styles[status.replace('-', '_')]}`}>
      <div className={styles.header}>
        <span className={styles.icon} aria-hidden="true">{category.icon}</span>
        <div className={styles.info}>
          <h2 className={styles.name}>{category.nameUk}</h2>
          <p className={styles.description}>{category.description}</p>
        </div>
      </div>

      <div className={styles.meta}>
        <span className={`${styles.status}`} aria-label={`Статус: ${STATUS_LABELS[status]}`}>
          {STATUS_LABELS[status]}
        </span>
        {total > 0 && (
          <span className={styles.count} aria-label={`Оцінено ${assessed} з ${total}`}>
            {assessed} / {total}
          </span>
        )}
      </div>

      <button
        className={styles.button}
        onClick={() => onSelect(category.id)}
        aria-label={`${status === 'in-progress' ? 'Продовжити' : 'Оцінити'} категорію ${category.nameUk}`}
      >
        {status === 'in-progress' ? 'Продовжити' : 'Оцінити категорію'}
      </button>
    </article>
  );
}

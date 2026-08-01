import type { AppStorage } from '../types';
import type { NavigateFunction } from 'react-router-dom';
import { AnimeGuide } from '../components';
import styles from './WelcomePage.module.css';

interface Props {
  storage: AppStorage;
  onNavigate: NavigateFunction;
}

export function WelcomePage({ storage, onNavigate }: Props) {
  const hasInProgress = Object.values(storage.categoryProgress).some(
    (p) => p.status === 'in-progress'
  );

  const inProgressCategory = hasInProgress
    ? Object.values(storage.categoryProgress).find((p) => p.status === 'in-progress')
    : null;

  return (
    <div className={styles.wrapper}>
      <AnimeGuide
        message="Тут немає правильних або неправильних відповідей. Ти можеш обрати лише одну категорію, оцінити її та зупинитися. Відповіді автоматично зберігаються."
      />

      <div className={styles.stack}>
        <button className="btn-primary" onClick={() => onNavigate('/categories')}>
          Обрати категорію
        </button>

        {hasInProgress && inProgressCategory && (
          <button
            className="btn-secondary"
            onClick={() => onNavigate(`/assess/${inProgressCategory.categoryId}`)}
          >
            Продовжити незавершену категорію
          </button>
        )}

        <button className="btn-secondary" onClick={() => onNavigate('/results')}>
          Переглянути результати
        </button>

        <button className="btn-secondary" onClick={() => onNavigate('/search')}>
          Знайти окремий продукт
        </button>
      </div>
    </div>
  );
}

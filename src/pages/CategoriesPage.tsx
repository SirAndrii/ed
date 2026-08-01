import type { AppStorage } from '../types';
import type { NavigateFunction } from 'react-router-dom';
import { CATEGORIES } from '../data';
import { CategoryCard } from '../components';
import styles from './CategoriesPage.module.css';

interface Props {
  storage: AppStorage;
  onNavigate: NavigateFunction;
}

export function CategoriesPage({ storage, onNavigate }: Props) {
  return (
    <div>
      <h1 className="page-title">Категорії</h1>
      <p className="page-subtitle">
        Можна обрати будь-яку категорію та зупинитися після неї.
      </p>
      <div className={styles.grid}>
        {CATEGORIES.map((cat) => (
          <CategoryCard
            key={cat.id}
            category={cat}
            progress={storage.categoryProgress[cat.id]}
            onSelect={(id) => onNavigate(`/assess/${id}`)}
          />
        ))}
      </div>
    </div>
  );
}

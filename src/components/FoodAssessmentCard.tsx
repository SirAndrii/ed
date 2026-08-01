import type { FoodItem, FoodAssessment, DifficultyLevel } from '../types';
import { StoreTags } from './StoreTags';
import styles from './FoodAssessmentCard.module.css';

const OPTIONS: { value: DifficultyLevel; label: string; description: string }[] = [
  { value: 'low',        label: 'Низька складність',  description: 'Зазвичай можу їсти без значної тривоги.' },
  { value: 'medium',     label: 'Середня складність', description: 'Може бути тривожно або залежить від ситуації.' },
  { value: 'high',       label: 'Висока складність',  description: 'Зараз викликає сильну тривогу або бажання уникнути.' },
  { value: 'unsure',     label: 'Не знаю',            description: 'Не впевнена, як це оцінити.' },
  { value: 'unfamiliar', label: 'Не знайома',         description: 'Не їла або не пам\'ятаю цей продукт.' },
];

interface Props {
  food: FoodItem;
  assessment: FoodAssessment | null;
  showStoreTags: boolean;
  /** Called immediately on click — saves to localStorage and auto-advances */
  onSelect: (value: DifficultyLevel) => void;
  onBack: () => void;
  onExit: () => void;
  isFirst: boolean;
}

export function FoodAssessmentCard({
  food,
  assessment,
  showStoreTags,
  onSelect,
  onBack,
  onExit,
  isFirst,
}: Props) {
  const current = assessment?.current ?? null;

  return (
    <div className={styles.card}>
      <div className={styles.foodHeader}>
        <div className={styles.nameRow}>
          <h2 className={styles.nameUk}>{food.nameUk}</h2>
          {food.nameEn && food.nameEn !== food.nameUk && (
            <span className={styles.nameEn}>{food.nameEn}</span>
          )}
        </div>
        {showStoreTags && food.storeTags.length > 0 && (
          <StoreTags tags={food.storeTags} />
        )}
      </div>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>
          Наскільки складним для тебе здається цей продукт зараз?
        </legend>
        <div className={styles.options}>
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`${styles.option} ${styles[opt.value]} ${current === opt.value ? styles.selected : ''}`}
              onClick={() => onSelect(opt.value)}
              aria-pressed={current === opt.value}
            >
              <span className={styles.optLabel}>{opt.label}</span>
              <span className={styles.optDesc}>{opt.description}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <div className={styles.nav}>
        <button
          className={styles.btnSecondary}
          onClick={onBack}
          disabled={isFirst}
          aria-label="Назад до попереднього продукту"
        >
          ← Назад
        </button>
        <button
          className={styles.btnGhost}
          onClick={onExit}
          aria-label="Вийти з опитування"
        >
          Вийти
        </button>
      </div>
    </div>
  );
}

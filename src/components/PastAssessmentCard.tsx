import type { FoodItem, FoodAssessment, PastDifficultyLevel } from '../types';
import styles from './PastAssessmentCard.module.css';

const CURRENT_LABELS: Record<string, string> = {
  low: 'Низька',
  medium: 'Середня',
  high: 'Висока',
  unsure: 'Не знаю',
  unfamiliar: 'Не знайома',
  skipped: 'Пропущено',
};

const OPTIONS: { value: PastDifficultyLevel; label: string }[] = [
  { value: 'low',           label: 'Низька складність' },
  { value: 'medium',        label: 'Середня складність' },
  { value: 'high',          label: 'Висока складність' },
  { value: 'unsure',        label: 'Не знаю' },
  { value: 'dont-remember', label: 'Не пам\'ятаю' },
  { value: 'not-eaten-then', label: 'Не їла рік тому' },
];

interface Props {
  food: FoodItem;
  assessment: FoodAssessment | null;
  /** Called immediately on click — saves and auto-advances */
  onSelect: (value: PastDifficultyLevel) => void;
  onBack: () => void;
  onExit: () => void;
  isFirst: boolean;
}

export function PastAssessmentCard({
  food,
  assessment,
  onSelect,
  onBack,
  onExit,
  isFirst,
}: Props) {
  const past = assessment?.oneYearAgo ?? null;
  const current = assessment?.current;

  return (
    <div className={styles.card}>
      <div className={styles.foodHeader}>
        <div className={styles.nameRow}>
          <h2 className={styles.nameUk}>{food.nameUk}</h2>
          {food.nameEn && food.nameEn !== food.nameUk && (
            <span className={styles.nameEn}>{food.nameEn}</span>
          )}
        </div>
        {current && (
          <span className={`${styles.currentBadge} ${styles[current]}`}>
            Зараз: {CURRENT_LABELS[current] ?? current}
          </span>
        )}
      </div>

      <div className={styles.hint}>
        Це не тест пам'яті. Приблизна відповідь або «не пам'ятаю» — нормальні варіанти.
      </div>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>
          А приблизно рік тому цей продукт здавався тобі…
        </legend>
        <div className={styles.options}>
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`${styles.option} ${past === opt.value ? styles.selected : ''}`}
              onClick={() => onSelect(opt.value)}
              aria-pressed={past === opt.value}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className={styles.nav}>
        <button
          className={styles.btnSecondary}
          onClick={onBack}
          disabled={isFirst}
          aria-label="Назад"
        >
          ← Назад
        </button>
        <button
          className={styles.btnGhost}
          onClick={onExit}
          aria-label="Вийти з опитування за минулий рік"
        >
          Вийти
        </button>
      </div>
    </div>
  );
}

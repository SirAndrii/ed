import type { FoodItem, FoodAssessment, DifficultyLevel, PastDifficultyLevel } from '../types';
import { DifficultySelector } from './DifficultySelector';
import { PastDifficultySelector } from './PastDifficultySelector';
import { StoreTags } from './StoreTags';
import styles from './FoodAssessmentCard.module.css';

interface Props {
  food: FoodItem;
  assessment: FoodAssessment | null;
  showStoreTags: boolean;
  onChangeCurrent: (value: DifficultyLevel) => void;
  onChangePast: (value: PastDifficultyLevel) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  onSaveExit: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export function FoodAssessmentCard({
  food,
  assessment,
  showStoreTags,
  onChangeCurrent,
  onChangePast,
  onNext,
  onBack,
  onSkip,
  onSaveExit,
  isFirst,
  isLast,
}: Props) {
  return (
    <div className={styles.card}>
      <div className={styles.foodHeader}>
        <h2 className={styles.nameUk}>{food.nameUk}</h2>
        <p className={styles.nameEn}>{food.nameEn}</p>
        {showStoreTags && <StoreTags tags={food.storeTags} />}
        <p className={styles.storeNote} aria-live="off">
          Позначка магазину не гарантує, що продукт зараз є в наявності.
        </p>
      </div>

      <DifficultySelector
        value={assessment?.current ?? null}
        onChange={onChangeCurrent}
      />

      <PastDifficultySelector
        value={assessment?.oneYearAgo ?? null}
        onChange={onChangePast}
      />

      <div className={styles.nav}>
        <button
          className={styles.btnSecondary}
          onClick={onBack}
          disabled={isFirst}
          aria-label="Назад до попереднього продукту"
        >
          ← Назад
        </button>

        <div className={styles.navRight}>
          <button
            className={styles.btnGhost}
            onClick={onSkip}
            aria-label="Пропустити цей продукт"
          >
            Пропустити
          </button>
          <button
            className={styles.btnGhost}
            onClick={onSaveExit}
            aria-label="Зберегти і вийти"
          >
            Зберегти й вийти
          </button>
          <button
            className={styles.btnPrimary}
            onClick={onNext}
            aria-label={isLast ? 'Завершити категорію' : 'Наступний продукт'}
          >
            {isLast ? 'Завершити' : 'Далі →'}
          </button>
        </div>
      </div>
    </div>
  );
}

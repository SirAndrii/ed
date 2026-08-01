import type { PastDifficultyLevel } from '../types';
import styles from './PastDifficultySelector.module.css';

interface Option {
  value: PastDifficultyLevel;
  label: string;
}

const OPTIONS: Option[] = [
  { value: 'low', label: 'Низька складність' },
  { value: 'medium', label: 'Середня складність' },
  { value: 'high', label: 'Висока складність' },
  { value: 'unsure', label: 'Не знаю' },
  { value: 'dont-remember', label: 'Не пам\'ятаю' },
  { value: 'not-eaten-then', label: 'Не їла рік тому' },
  { value: 'skipped', label: 'Пропустити' },
];

interface Props {
  value: PastDifficultyLevel | null;
  onChange: (value: PastDifficultyLevel) => void;
}

export function PastDifficultySelector({ value, onChange }: Props) {
  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>
        А приблизно рік тому цей продукт здавався тобі…
        <span className={styles.hint}>Це не тест пам'яті. Приблизна відповідь або «не пам'ятаю» — нормальні варіанти.</span>
      </legend>
      <div className={styles.options}>
        {OPTIONS.map((opt) => (
          <label
            key={opt.value}
            className={`${styles.option} ${value === opt.value ? styles.selected : ''}`}
          >
            <input
              type="radio"
              name="past-difficulty"
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              className={styles.radio}
            />
            <span className={styles.label}>{opt.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

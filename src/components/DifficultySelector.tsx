import type { DifficultyLevel } from '../types';
import styles from './DifficultySelector.module.css';

interface Option {
  value: DifficultyLevel;
  label: string;
  description: string;
}

const OPTIONS: Option[] = [
  { value: 'low', label: 'Низька складність', description: 'Зазвичай можу їсти без значної тривоги.' },
  { value: 'medium', label: 'Середня складність', description: 'Може бути тривожно або залежить від ситуації.' },
  { value: 'high', label: 'Висока складність', description: 'Зараз викликає сильну тривогу або бажання уникнути.' },
  { value: 'unsure', label: 'Не знаю', description: 'Не впевнена, як це оцінити.' },
  { value: 'unfamiliar', label: 'Не знайома', description: 'Не їла або не пам\'ятаю цей продукт.' },
  { value: 'skipped', label: 'Пропустити', description: 'Пропустити без пояснення.' },
];

const LEVEL_CLASS: Record<DifficultyLevel, string> = {
  low: styles.low,
  medium: styles.medium,
  high: styles.high,
  unsure: styles.unsure,
  unfamiliar: styles.unfamiliar,
  skipped: styles.skipped,
};

interface Props {
  value: DifficultyLevel | null;
  onChange: (value: DifficultyLevel) => void;
}

export function DifficultySelector({ value, onChange }: Props) {
  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>Наскільки складним для тебе здається цей продукт зараз?</legend>
      <div className={styles.options}>
        {OPTIONS.map((opt) => (
          <label
            key={opt.value}
            className={`${styles.option} ${LEVEL_CLASS[opt.value]} ${value === opt.value ? styles.selected : ''}`}
          >
            <input
              type="radio"
              name="difficulty"
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              className={styles.radio}
            />
            <span className={styles.label}>{opt.label}</span>
            <span className={styles.desc}>{opt.description}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

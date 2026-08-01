import { useTheme, type Theme } from '../context/ThemeContext';
import styles from './ThemeToggle.module.css';

const THEMES: { value: Theme; label: string; icon: string }[] = [
  { value: 'anime', label: 'Аніме', icon: '🦊' },
  { value: 'kawaii', label: 'Kawaii', icon: '🌸' },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className={styles.wrapper} role="group" aria-label="Вибір теми">
      {THEMES.map((t) => (
        <button
          key={t.value}
          className={`${styles.btn} ${theme === t.value ? styles.active : ''}`}
          onClick={() => setTheme(t.value)}
          aria-pressed={theme === t.value}
          aria-label={`Тема: ${t.label}`}
          title={t.label}
        >
          <span aria-hidden="true">{t.icon}</span>
          <span className={styles.label}>{t.label}</span>
        </button>
      ))}
    </div>
  );
}

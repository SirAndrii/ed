import { useRef } from 'react';
import type { useAppStorage } from '../hooks/useAppStorage';
import styles from './SettingsPage.module.css';

interface Props {
  storageHook: ReturnType<typeof useAppStorage>;
}

export function SettingsPage({ storageHook }: Props) {
  const { storage, updatePreferences, enablePastSurvey, handleReset, handleExport, handleImport } = storageHook;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await handleImport(file);
      alert('Дані успішно імпортовано.');
    } catch {
      alert('Не вдалося імпортувати. Перевір формат файлу.');
    }
    e.target.value = '';
  };

  const handleResetClick = () => {
    const confirmed = window.confirm(
      'Видалити всі збережені оцінки? Це незворотна дія.'
    );
    if (confirmed) handleReset();
  };

  return (
    <div className={styles.wrapper}>
      <h1 className="page-title">Налаштування</h1>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Налаштування відображення</h2>

        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={storage.preferences.showStoreTags}
            onChange={(e) => updatePreferences({ showStoreTags: e.target.checked })}
          />
          <span>Показувати позначки магазинів</span>
        </label>

        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={storage.preferences.reducedMotion}
            onChange={(e) => updatePreferences({ reducedMotion: e.target.checked })}
          />
          <span>Зменшити анімації</span>
        </label>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Опитування «рік тому»</h2>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={storage.preferences.enablePastSurvey}
            onChange={(e) => enablePastSurvey(e.target.checked)}
          />
          <span>Запитувати про складність рік тому після кожної категорії</span>
        </label>
        {storage.pastSurveySession && (
          <p className={styles.note}>
            Увімкнено: {new Date(storage.pastSurveySession.enabledAt).toLocaleDateString('uk-UA')}.{' '}
            Точка відліку «рік тому»: {new Date(storage.pastSurveySession.referenceDate).toLocaleDateString('uk-UA')}.
          </p>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Ім'я у звіті (необов'язково)</h2>
        <input
          type="text"
          className={styles.input}
          value={storage.preferences.reportName}
          onChange={(e) => updatePreferences({ reportName: e.target.value })}
          placeholder="Ім'я або псевдонім"
          maxLength={60}
          aria-label="Ім'я або псевдонім у звіті"
        />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Дані</h2>
        <p className={styles.note}>
          Дані зберігаються лише в цьому браузері. Якщо очистити дані браузера або перейти на інший пристрій, вони не перенесуться автоматично.
        </p>
        <div className="stack">
          <button className="btn-secondary" onClick={handleExport}>
            Експортувати всі дані
          </button>
          <button className="btn-secondary" onClick={handleImportClick}>
            Імпортувати дані
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            aria-hidden="true"
          />
          <button className={styles.btnDanger} onClick={handleResetClick}>
            Видалити всі дані
          </button>
        </div>
      </section>
    </div>
  );
}

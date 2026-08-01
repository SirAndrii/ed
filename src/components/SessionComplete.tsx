import styles from './SessionComplete.module.css';

interface Props {
  categoryName: string;
  onViewResults: () => void;
  onPrint: () => void;
  onBackToCategories: () => void;
  onFinishForToday: () => void;
  onChooseAnother?: () => void;
  onStartPastSurvey?: () => void;
}

export function SessionComplete({
  categoryName,
  onViewResults,
  onPrint,
  onBackToCategories,
  onFinishForToday,
  onChooseAnother,
  onStartPastSurvey,
}: Props) {
  return (
    <div className={styles.wrapper} role="main">
      <div className={styles.messageBox}>
        <p className={styles.emoji} aria-hidden="true">✨</p>
        <p className={styles.message}>
          Категорію «{categoryName}» завершено. Відповіді збережені.
        </p>
        <p className={styles.hint}>
          Тобі не потрібно зараз оцінювати інші категорії.
        </p>
      </div>

      <div className={styles.actions}>
        <button className={styles.btnPrimary} onClick={onViewResults}>
          Переглянути результати цієї категорії
        </button>
        <button className={styles.btnSecondary} onClick={onPrint}>
          Роздрукувати цю категорію
        </button>
        <button className={styles.btnSecondary} onClick={onBackToCategories}>
          Повернутися до категорій
        </button>
        <button className={styles.btnSecondary} onClick={onFinishForToday}>
          Завершити на сьогодні
        </button>
      </div>

      {onStartPastSurvey && (
        <button className={styles.btnLink} onClick={onStartPastSurvey}>
          Оцінити, як це було рік тому →
        </button>
      )}

      {onChooseAnother && (
        <button className={styles.btnLink} onClick={onChooseAnother}>
          Обрати іншу категорію
        </button>
      )}
    </div>
  );
}

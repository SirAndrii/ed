import styles from './BlockBreak.module.css';

interface Props {
  categoryName: string;
  onContinue: () => void;
  onBreak: () => void;
  onViewPartial: () => void;
  onFinishNow: () => void;
}

export function BlockBreak({ categoryName, onContinue, onBreak, onViewPartial, onFinishNow }: Props) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.box}>
        <p className={styles.emoji} aria-hidden="true">🌿</p>
        <p className={styles.message}>Цю частину категорії завершено. Відповіді вже збережені.</p>
        <p className={styles.sub}>{categoryName}</p>
      </div>
      <div className={styles.actions}>
        <button className={styles.btnPrimary} onClick={onContinue}>Продовжити цю категорію</button>
        <button className={styles.btnSecondary} onClick={onBreak}>Зробити перерву</button>
        <button className={styles.btnSecondary} onClick={onViewPartial}>Переглянути результат цієї частини</button>
        <button className={styles.btnSecondary} onClick={onFinishNow}>Завершити категорію зараз</button>
      </div>
    </div>
  );
}

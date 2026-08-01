import styles from './CategoryProgress.module.css';

interface Props {
  categoryName: string;
  current: number;
  total: number;
}

export function CategoryProgress({ categoryName, current, total }: Props) {
  const percent = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div className={styles.wrapper} aria-label={`${categoryName}, продукт ${current} з ${total}`}>
      <div className={styles.text}>
        <span className={styles.name}>{categoryName}</span>
        <span className={styles.count}>
          Продукт {current} із {total}
        </span>
      </div>
      <div className={styles.bar} role="progressbar" aria-valuenow={current} aria-valuemin={0} aria-valuemax={total}>
        <div className={styles.fill} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

import type { StoreTag } from '../types';
import styles from './StoreTags.module.css';

const TAG_LABELS: Record<StoreTag, string> = {
  heb: 'H-E-B',
  phoenicia: 'Phoenicia',
  'common-us': 'US',
  'eastern-european': 'Схід. Євр.',
};

interface Props {
  tags: StoreTag[];
}

export function StoreTags({ tags }: Props) {
  if (!tags.length) return null;
  return (
    <div className={styles.tags} aria-label="Де шукати">
      {tags.map((tag) => (
        <span key={tag} className={`${styles.tag} ${styles[tag.replace('-', '_')]}`}>
          {TAG_LABELS[tag]}
        </span>
      ))}
    </div>
  );
}

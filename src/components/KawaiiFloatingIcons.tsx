import { useState, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import styles from './KawaiiFloatingIcons.module.css';

const ICONS = [
  'streamline-emojis:strawberry-1',
  'streamline-emojis:tomato',
  'streamline-emojis:bread',
  'streamline-emojis:cooked-rice',
  'streamline-emojis:spaghetti',
  'streamline-emojis:custard',
  'streamline-emojis:hatching-chick-1',
  'streamline-emojis:poultry-leg',
  'streamline-emojis:tropical-fish',
  'streamline-emojis:herb',
  'streamline-emojis:french-fries',
  'streamline-emojis:chestnut',
  'streamline-emojis:honey-pot',
  'streamline-emojis:shortcake-1',
  'streamline-emojis:cookie',
  'streamline-emojis:teacup-without-handle',
  'streamline-emojis:hamburger-1',
  'streamline-emojis:sparkling-heart',
  'streamline-emojis:lollipop',
  'streamline-emojis:cupcake',
  'streamline-emojis:ice-cream-1',
  'streamline-emojis:doughnut',
];

const COUNT = 16;
const OPACITY = 0.22;

interface FloatingIcon {
  icon: string;
  x: number;    // vw %
  y: number;    // vh %
  size: number; // px
  dur: number;  // float animation duration (s)
  delay: number;// float animation delay (s)
}

function randomIcons(): FloatingIcon[] {
  return Array.from({ length: COUNT }, () => ({
    icon: ICONS[Math.floor(Math.random() * ICONS.length)],
    x: 3 + Math.random() * 92,
    y: 3 + Math.random() * 92,
    size: 24 + Math.random() * 22,
    dur: 3 + Math.random() * 3,
    delay: Math.random() * 4,
  }));
}

interface Props {
  advanceTick: number;
}

export function KawaiiFloatingIcons({ advanceTick }: Props) {
  const [icons, setIcons] = useState<FloatingIcon[]>(randomIcons);
  const [burstSet, setBurstSet] = useState<Set<number>>(new Set());
  const prevTickRef = useRef(0);

  useEffect(() => {
    if (advanceTick === prevTickRef.current) return;
    prevTickRef.current = advanceTick;

    // Trigger burst animation on all icons
    setBurstSet(new Set(Array.from({ length: COUNT }, (_, i) => i)));

    // After burst, move to new positions
    const t = setTimeout(() => {
      setIcons(randomIcons());
      setBurstSet(new Set());
    }, 350);

    return () => clearTimeout(t);
  }, [advanceTick]);

  return (
    <div className={styles.layer} aria-hidden="true">
      {icons.map((item, i) => (
        <div
          key={i}
          className={`${styles.icon} ${burstSet.has(i) ? styles.burst : ''}`}
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            opacity: OPACITY,
            '--dur': `${item.dur}s`,
            '--delay': `${item.delay}s`,
          } as React.CSSProperties}
        >
          <Icon icon={item.icon} width={item.size} height={item.size} />
        </div>
      ))}
    </div>
  );
}

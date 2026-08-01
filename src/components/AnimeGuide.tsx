import styles from './AnimeGuide.module.css';

interface Props {
  message?: string;
  visible?: boolean;
}

export function AnimeGuide({ message, visible = true }: Props) {
  if (!visible) return null;
  return (
    <div className={styles.guide} role="status" aria-live="polite">
      <div className={styles.fox} aria-hidden="true">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Fox body */}
          <ellipse cx="24" cy="30" rx="14" ry="12" fill="#FF8C42"/>
          {/* Fox head */}
          <circle cx="24" cy="18" r="11" fill="#FF8C42"/>
          {/* Left ear */}
          <polygon points="13,10 8,2 18,8" fill="#FF8C42"/>
          <polygon points="13,10 10,4 16,8" fill="#FFB347"/>
          {/* Right ear */}
          <polygon points="35,10 40,2 30,8" fill="#FF8C42"/>
          <polygon points="35,10 38,4 32,8" fill="#FFB347"/>
          {/* Face */}
          <circle cx="20" cy="17" r="2" fill="#3D2B1F"/>
          <circle cx="28" cy="17" r="2" fill="#3D2B1F"/>
          {/* Eye shine */}
          <circle cx="21" cy="16" r="0.7" fill="white"/>
          <circle cx="29" cy="16" r="0.7" fill="white"/>
          {/* Muzzle */}
          <ellipse cx="24" cy="22" rx="5" ry="3" fill="#FFD4B0"/>
          {/* Nose */}
          <ellipse cx="24" cy="20.5" rx="1.2" ry="0.8" fill="#3D2B1F"/>
          {/* Smile */}
          <path d="M21 23 Q24 25 27 23" stroke="#3D2B1F" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
          {/* Tail */}
          <path d="M10 36 Q2 30 8 24 Q12 32 16 34" fill="#FF8C42"/>
          <path d="M10 36 Q4 31 9 26 Q11 31 14 33" fill="#FFF0E0"/>
          {/* Belly */}
          <ellipse cx="24" cy="33" rx="8" ry="7" fill="#FFD4B0"/>
        </svg>
      </div>
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
}

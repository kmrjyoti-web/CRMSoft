import styles from '../travvellis.module.css';
import { Seagulls } from './Seagulls';

interface Props {
  sceneRef: React.Ref<HTMLDivElement>;
}

export function SailScene({ sceneRef }: Props) {
  return (
    <div ref={sceneRef} className={styles.fgScene}>
      <div className={styles.sea}>
        <div className={`${styles.wave} ${styles.wave1}`} />
        <div className={`${styles.wave} ${styles.wave2}`} />
        <div className={`${styles.wave} ${styles.wave3}`} />
        <div className={styles.foam} />
      </div>

      {/* Large sailboat */}
      <div className={styles.boat} style={{ ['--bdur' as string]: '22s' } as React.CSSProperties}>
        <svg width="140" height="160" viewBox="0 0 140 160">
          <path d="M12 122 Q70 138 128 122 L118 148 Q70 156 22 148 Z" fill="#2a1a0e" stroke="#4a2a1a" strokeWidth="1" />
          <line x1="70" y1="122" x2="70" y2="12" stroke="#2a1a0e" strokeWidth="2.5" />
          <path d="M70 14 Q110 50 106 110 L70 110 Z" fill="#fef8e8" stroke="#c0a060" strokeWidth="1" />
          <path d="M70 20 Q40 70 52 112 L70 112 Z" fill="#fef8e8" stroke="#c0a060" strokeWidth="1" />
          <path d="M70 14 L86 10 L80 18 L70 18 Z" fill="#c74a3e" />
        </svg>
      </div>

      {/* Small sailboat */}
      <div
        className={styles.boat}
        style={{ ['--bdur' as string]: '28s', animationDelay: '-14s', transformOrigin: '50% 100%' } as React.CSSProperties}
      >
        <svg width="90" height="100" viewBox="0 0 90 100">
          <path d="M6 78 Q45 88 84 78 L78 94 Q45 100 12 94 Z" fill="#2a1a0e" />
          <line x1="45" y1="78" x2="45" y2="16" stroke="#2a1a0e" strokeWidth="2" />
          <path d="M45 18 Q72 42 68 72 L45 72 Z" fill="#fef8e8" stroke="#c0a060" strokeWidth="1" />
        </svg>
      </div>

      <Seagulls count={6} />
    </div>
  );
}

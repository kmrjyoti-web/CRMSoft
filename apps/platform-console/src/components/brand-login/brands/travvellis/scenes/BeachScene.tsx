import styles from '../travvellis.module.css';
import { Seagulls } from './Seagulls';

interface Props {
  sceneRef: React.Ref<HTMLDivElement>;
}

export function BeachScene({ sceneRef }: Props) {
  return (
    <div ref={sceneRef} className={styles.fgScene}>
      <div className={styles.sea}>
        <div className={`${styles.wave} ${styles.wave1}`} />
        <div className={`${styles.wave} ${styles.wave2}`} />
        <div className={`${styles.wave} ${styles.wave3}`} />
        <div className={styles.foam} />
      </div>

      {/* Palm tree left */}
      <svg className={styles.palm} style={{ left: '8%' }} width="130" height="220" viewBox="0 0 130 220">
        <path d="M64 218 Q64 160 58 110 Q54 70 62 30" stroke="#1a1208" strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M62 32 Q30 20 8 30 Q26 36 62 34 Z" fill="#0f1f10" />
        <path d="M62 32 Q32 16 14 8 Q32 30 62 34 Z" fill="#163221" />
        <path d="M62 32 Q92 20 122 30 Q98 36 62 34 Z" fill="#0f1f10" />
        <path d="M62 32 Q94 14 116 4 Q94 28 62 34 Z" fill="#163221" />
        <path d="M62 32 Q58 4 72 -4 Q62 22 62 34 Z" fill="#0f1f10" />
      </svg>

      {/* Palm tree right */}
      <svg className={styles.palm} style={{ right: '12%', animationDelay: '-1.5s' }} width="110" height="180" viewBox="0 0 130 220">
        <path d="M64 218 Q64 160 58 110 Q54 70 62 30" stroke="#1a1208" strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M62 32 Q30 20 8 30 Q26 36 62 34 Z" fill="#0f1f10" />
        <path d="M62 32 Q32 16 14 8 Q32 30 62 34 Z" fill="#163221" />
        <path d="M62 32 Q92 20 122 30 Q98 36 62 34 Z" fill="#0f1f10" />
        <path d="M62 32 Q94 14 116 4 Q94 28 62 34 Z" fill="#163221" />
      </svg>

      {/* Couple silhouette */}
      <svg className={styles.couple} style={{ left: '48%' }} width="90" height="120" viewBox="0 0 90 120">
        <circle cx="28" cy="22" r="8" fill="#1a1208" />
        <path d="M18 30 L18 68 Q18 74 22 74 L34 74 Q38 74 38 68 L38 40 L42 40 L42 70 L46 70 L46 30 Z" fill="#1a1208" />
        <rect x="22" y="72" width="6" height="40" fill="#1a1208" />
        <rect x="30" y="72" width="6" height="40" fill="#1a1208" />
        <circle cx="62" cy="26" r="7" fill="#1a1208" />
        <path d="M53 34 L53 70 Q53 75 57 75 L66 75 Q70 75 70 70 L70 44 L74 44 L74 72 L78 72 L78 34 Z" fill="#1a1208" />
        <rect x="56" y="73" width="5" height="38" fill="#1a1208" />
        <rect x="63" y="73" width="5" height="38" fill="#1a1208" />
        <path d="M38 42 Q50 38 53 42" stroke="#1a1208" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M58 22 Q52 26 54 34 Q56 28 62 28" fill="#1a1208" />
      </svg>

      <Seagulls count={7} />

      {/* Dolphin */}
      <div className={styles.dolphin}>
        <svg viewBox="0 0 50 24" fill="rgba(40,70,100,.9)">
          <path d="M2 18 Q12 6 26 10 Q38 12 48 6 Q44 14 34 18 Q24 20 14 18 Z M30 4 L38 2 L34 10 Z" />
        </svg>
      </div>
    </div>
  );
}

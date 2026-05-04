import styles from '../travvellis.module.css';

interface Props {
  sceneRef: React.Ref<HTMLDivElement>;
}

export function BalloonsScene({ sceneRef }: Props) {
  return (
    <div ref={sceneRef} className={styles.fgScene}>
      <div className={styles.mountains} style={{ opacity: 0.6 }} />

      {/* Orange balloon */}
      <div
        className={styles.balloon}
        style={{ left: '15%', ['--dur' as string]: '38s', ['--dx' as string]: '15vw', ['--dx2' as string]: '25vw' } as React.CSSProperties}
      >
        <svg width="80" height="120" viewBox="0 0 80 120">
          <defs>
            <radialGradient id="b1" cx="35%" cy="30%">
              <stop offset="0%" stopColor="#ffcc66" />
              <stop offset="100%" stopColor="#e14b3a" />
            </radialGradient>
          </defs>
          <ellipse cx="40" cy="48" rx="36" ry="44" fill="url(#b1)" />
          <path d="M4 48 Q4 80 22 92 L58 92 Q76 80 76 48" fill="none" stroke="rgba(0,0,0,.2)" strokeWidth="1" />
          <path d="M20 90 L28 108 M40 92 L40 108 M60 90 L52 108" stroke="#3a2a1c" strokeWidth="1.2" />
          <rect x="28" y="106" width="24" height="10" rx="1" fill="#6b4a2a" />
        </svg>
      </div>

      {/* Green balloon */}
      <div
        className={styles.balloon}
        style={{ left: '55%', ['--dur' as string]: '50s', ['--dx' as string]: '-10vw', ['--dx2' as string]: '-5vw', animationDelay: '-12s' } as React.CSSProperties}
      >
        <svg width="60" height="90" viewBox="0 0 60 90">
          <defs>
            <radialGradient id="b2" cx="35%" cy="30%">
              <stop offset="0%" stopColor="#88d8c0" />
              <stop offset="100%" stopColor="#2a7e6b" />
            </radialGradient>
          </defs>
          <ellipse cx="30" cy="36" rx="28" ry="34" fill="url(#b2)" />
          <path d="M16 68 L22 82 M30 70 L30 82 M44 68 L38 82" stroke="#3a2a1c" strokeWidth="1" />
          <rect x="22" y="80" width="16" height="7" rx="1" fill="#6b4a2a" />
        </svg>
      </div>

      {/* Purple balloon */}
      <div
        className={styles.balloon}
        style={{ left: '75%', ['--dur' as string]: '44s', ['--dx' as string]: '-8vw', ['--dx2' as string]: '-18vw', animationDelay: '-22s' } as React.CSSProperties}
      >
        <svg width="70" height="105" viewBox="0 0 70 105">
          <defs>
            <radialGradient id="b3" cx="35%" cy="30%">
              <stop offset="0%" stopColor="#c78dff" />
              <stop offset="100%" stopColor="#5e2a8a" />
            </radialGradient>
          </defs>
          <ellipse cx="35" cy="42" rx="32" ry="38" fill="url(#b3)" />
          <path d="M18 78 L26 94 M35 80 L35 94 M52 78 L44 94" stroke="#3a2a1c" strokeWidth="1" />
          <rect x="26" y="92" width="18" height="8" rx="1" fill="#6b4a2a" />
        </svg>
      </div>
    </div>
  );
}

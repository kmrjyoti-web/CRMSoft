'use client';

import { useMemo } from 'react';
import styles from '../travvellis.module.css';

interface Props {
  sceneRef: React.Ref<HTMLDivElement>;
}

export function NightScene({ sceneRef }: Props) {
  const lanterns = useMemo(() =>
    Array.from({ length: 22 }, () => ({
      left: Math.random() * 100,
      ldur: (18 + Math.random() * 18).toFixed(1),
      ldx: (Math.random() * 30 - 15).toFixed(1),
      delay: (-Math.random() * 30).toFixed(2),
    })),
  []);

  return (
    <div ref={sceneRef} className={styles.fgScene}>
      {/* Eiffel Tower */}
      <svg className={styles.landmark} style={{ left: '8%' }} width="80" height="200" viewBox="0 0 80 200">
        <path d="M40 4 L36 30 L44 30 Z" fill="rgba(20,15,8,.95)" />
        <path d="M36 30 L30 80 L50 80 L44 30 Z" fill="rgba(30,22,12,.95)" />
        <path d="M30 80 L18 170 L62 170 L50 80 Z" fill="rgba(30,22,12,.95)" />
        <path d="M18 170 L4 200 L76 200 L62 170 Z" fill="rgba(30,22,12,.95)" />
        <line x1="30" y1="80" x2="50" y2="170" stroke="rgba(80,60,30,.6)" strokeWidth="1" />
        <line x1="50" y1="80" x2="30" y2="170" stroke="rgba(80,60,30,.6)" strokeWidth="1" />
        <line x1="18" y1="170" x2="62" y2="200" stroke="rgba(80,60,30,.5)" strokeWidth="1" />
        <line x1="62" y1="170" x2="18" y2="200" stroke="rgba(80,60,30,.5)" strokeWidth="1" />
      </svg>

      {/* Taj Mahal */}
      <svg className={styles.landmark} style={{ left: '38%' }} width="180" height="140" viewBox="0 0 180 140">
        <rect x="10" y="40" width="14" height="95" fill="rgba(30,22,14,.9)" />
        <ellipse cx="17" cy="38" rx="9" ry="10" fill="rgba(30,22,14,.9)" />
        <path d="M17 26 L17 18" stroke="rgba(30,22,14,.9)" strokeWidth="2" />
        <rect x="156" y="40" width="14" height="95" fill="rgba(30,22,14,.9)" />
        <ellipse cx="163" cy="38" rx="9" ry="10" fill="rgba(30,22,14,.9)" />
        <path d="M163 26 L163 18" stroke="rgba(30,22,14,.9)" strokeWidth="2" />
        <rect x="40" y="70" width="100" height="65" fill="rgba(35,25,15,.95)" />
        <path d="M60 70 Q90 10 120 70 Z" fill="rgba(35,25,15,.95)" />
        <path d="M90 10 L90 -2" stroke="rgba(35,25,15,.95)" strokeWidth="3" />
        <path d="M46 70 Q54 50 62 70 Z" fill="rgba(30,22,14,.9)" />
        <path d="M118 70 Q126 50 134 70 Z" fill="rgba(30,22,14,.9)" />
        <path d="M82 135 L82 100 Q90 88 98 100 L98 135 Z" fill="rgba(255,180,80,.5)" />
      </svg>

      {/* Great Wall */}
      <svg className={styles.landmark} style={{ right: '5%', bottom: '22vh' }} width="240" height="80" viewBox="0 0 240 80">
        <path d="M0 70 L20 50 L30 58 L50 38 L60 50 L80 30 L95 50 L120 22 L140 50 L160 28 L180 50 L200 34 L220 50 L240 40 L240 80 L0 80 Z" fill="rgba(30,22,14,.9)" />
        <rect x="18" y="44" width="6" height="12" fill="rgba(30,22,14,.95)" />
        <rect x="58" y="44" width="6" height="12" fill="rgba(30,22,14,.95)" />
        <rect x="118" y="16" width="6" height="14" fill="rgba(30,22,14,.95)" />
        <rect x="158" y="22" width="6" height="14" fill="rgba(30,22,14,.95)" />
        <rect x="198" y="28" width="6" height="14" fill="rgba(30,22,14,.95)" />
      </svg>

      {/* 22 lanterns */}
      <div style={{ position: 'absolute', inset: 0 }}>
        {lanterns.map((l, i) => (
          <div
            key={i}
            className={styles.lantern}
            style={{
              left: `${l.left}%`,
              bottom: '10vh',
              ['--ldur' as string]: `${l.ldur}s`,
              ['--ldx' as string]: `${l.ldx}vw`,
              animationDelay: `${l.delay}s`,
            } as React.CSSProperties}
          />
        ))}
      </div>
    </div>
  );
}

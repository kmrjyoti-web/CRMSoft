'use client';

import { useMemo } from 'react';
import styles from '../travvellis.module.css';

interface Props {
  count: number;
}

export function Seagulls({ count }: Props) {
  const gulls = useMemo(() =>
    Array.from({ length: count }, () => ({
      top: 8 + Math.random() * 28,
      sc: (0.5 + Math.random() * 0.7).toFixed(2),
      dur: (22 + Math.random() * 22).toFixed(1),
      delay: (-Math.random() * 40).toFixed(2),
    })),
  [count]);

  return (
    <div className={styles.gulls}>
      {gulls.map((g, i) => (
        <div
          key={i}
          className={styles.gull}
          style={{
            top: `${g.top}%`,
            ['--sc' as string]: g.sc,
            ['--gdur' as string]: `${g.dur}s`,
            animationDelay: `${g.delay}s`,
          } as React.CSSProperties}
        >
          <svg viewBox="0 0 22 12" fill="rgba(30,30,40,.85)">
            <path d="M0 7 Q4 1 8 5 Q10 2 11 5 Q12 2 14 5 Q18 1 22 7 Q18 5 14 6 Q12 5 11 6 Q10 5 8 6 Q4 5 0 7Z" />
          </svg>
        </div>
      ))}
    </div>
  );
}

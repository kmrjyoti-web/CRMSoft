'use client';

import { useMemo } from 'react';
import styles from '../travvellis.module.css';

export function Stars() {
  const stars = useMemo(() =>
    Array.from({ length: 170 }, (_, i) => ({
      id: i,
      big: Math.random() < 0.22,
      left: Math.random() * 100,
      top: Math.random() * 58,
      delay: (Math.random() * 3).toFixed(2),
      duration: (2 + Math.random() * 3).toFixed(2),
    })),
  []);

  return (
    <div className={styles.stars}>
      {stars.map((s) => (
        <div
          key={s.id}
          className={s.big ? `${styles.star} ${styles.starBig}` : styles.star}
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

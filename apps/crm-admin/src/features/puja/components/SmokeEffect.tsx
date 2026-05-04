"use client";

import { useEffect, useState } from "react";
import styles from "../PujaAnimations.module.css";

interface SmokeParticle {
  id: number;
  left: number;
  delay: number;
  size: number;
}

interface SmokeEffectProps {
  active: boolean;
  /** Anchor x position in px — smoke rises from here */
  originX?: number;
  /** Anchor y position in px from bottom */
  originY?: number;
}

let nextId = 0;

export function SmokeEffect({ active, originX = 0, originY = 0 }: SmokeEffectProps) {
  const [particles, setParticles] = useState<SmokeParticle[]>([]);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }

    // Spawn 6 smoke puffs at slight random offsets
    const newParticles: SmokeParticle[] = Array.from({ length: 6 }, (_, i) => ({
      id: nextId++,
      left: originX + (Math.random() * 14 - 7),
      delay: i * 0.18,
      size: 6 + Math.random() * 6,
    }));
    setParticles(newParticles);

    const timer = setTimeout(() => setParticles([]), 2000);
    return () => clearTimeout(timer);
  }, [active, originX, originY]);

  if (particles.length === 0) return null;

  return (
    <div
      style={{
        position: "absolute",
        bottom: originY + 20,
        left: 0,
        right: 0,
        pointerEvents: "none",
        overflow: "hidden",
        height: 80,
      }}
    >
      {particles.map((p) => (
        <div
          key={p.id}
          className={styles.smokeParticle}
          style={{
            left: p.left,
            bottom: 0,
            width: p.size,
            height: p.size,
            animationDelay: `${p.delay}s`,
            background: `rgba(${180 + Math.random() * 40}, ${180 + Math.random() * 40}, ${180 + Math.random() * 40}, 0.45)`,
          }}
        />
      ))}
    </div>
  );
}

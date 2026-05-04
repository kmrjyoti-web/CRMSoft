"use client";

import { useEffect, useState } from "react";
import styles from "../PujaAnimations.module.css";

const PETALS = ["🌸", "🌺", "🌼", "🪷", "🌹", "✿"];

interface Petal {
  id: number;
  left: number;
  emoji: string;
  delay: number;
  duration: number;
}

interface PetalShowerProps {
  active: boolean;
  count?: number;
}

let petalId = 0;

export function PetalShower({ active, count = 12 }: PetalShowerProps) {
  const [petals, setPetals] = useState<Petal[]>([]);

  useEffect(() => {
    if (!active) {
      setPetals([]);
      return;
    }

    const newPetals: Petal[] = Array.from({ length: count }, (_, i) => ({
      id: petalId++,
      left: 10 + Math.random() * 80,  // % across container
      emoji: PETALS[Math.floor(Math.random() * PETALS.length)],
      delay: i * 0.12,
      duration: 1.2 + Math.random() * 0.5,
    }));
    setPetals(newPetals);

    const maxDuration = Math.max(...newPetals.map((p) => p.delay + p.duration)) * 1000;
    const timer = setTimeout(() => setPetals([]), maxDuration + 100);
    return () => clearTimeout(timer);
  }, [active, count]);

  if (petals.length === 0) return null;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {petals.map((p) => (
        <div
          key={p.id}
          className={styles.petalParticle}
          style={{
            left: `${p.left}%`,
            bottom: "30%",
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        >
          {p.emoji}
        </div>
      ))}
    </div>
  );
}

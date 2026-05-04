'use client';

import { useState, useEffect, useRef } from 'react';
import { TOTAL_DURATION_S, TRAVEL_PHASES, PHASE_DURATION_S } from './constants';

export type TimelineState = {
  phaseIndex: number;
  phaseProgress: number; // 0–1 within the current phase
  totalProgress: number; // 0–1 for the full cycle
};

export function useAnimationTimeline(): TimelineState {
  const [state, setState] = useState<TimelineState>({
    phaseIndex: 0,
    phaseProgress: 0,
    totalProgress: 0,
  });

  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    let cancelled = false;

    function tick(now: number) {
      if (cancelled) return;
      if (startRef.current === null) startRef.current = now;

      const elapsed = (now - startRef.current) / 1000; // seconds
      const totalProgress = (elapsed % TOTAL_DURATION_S) / TOTAL_DURATION_S;
      const cycleElapsed = elapsed % TOTAL_DURATION_S;
      const phaseIndex = Math.min(
        Math.floor(cycleElapsed / PHASE_DURATION_S),
        TRAVEL_PHASES.length - 1,
      );
      const phaseProgress = (cycleElapsed % PHASE_DURATION_S) / PHASE_DURATION_S;

      setState({ phaseIndex, phaseProgress, totalProgress });
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return state;
}

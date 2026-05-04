'use client';

import { useEffect, useRef, useCallback } from 'react';
import { interp, DURATION, PHASES, Phase } from '../constants';

export interface TimelineRefs {
  rootRef: React.RefObject<HTMLDivElement | null>;
  photoRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
  sceneRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
  planeRef: React.RefObject<HTMLDivElement | null>;
  contrailRef: React.RefObject<HTMLDivElement | null>;
  hudPlaceRef: React.RefObject<HTMLDivElement | null>;
  hudSubRef: React.RefObject<HTMLDivElement | null>;
  chipRefs: React.MutableRefObject<(HTMLButtonElement | null)[]>;
  scrubRef: React.RefObject<HTMLInputElement | null>;
  scrubLabelRef: React.RefObject<HTMLSpanElement | null>;
  playBtnRef: React.RefObject<HTMLButtonElement | null>;
}

export function useAnimationTimeline(refs: TimelineRefs) {
  const playingRef = useRef(true);
  const startedAtRef = useRef(performance.now());
  const playheadRef = useRef(0);
  const rafRef = useRef<number>(0);
  const lastKeyRef = useRef<string | null>(null);
  const currentPhaseRef = useRef<Phase>(PHASES[0]);

  const applyFrame = useCallback((now: number) => {
    if (playingRef.current) {
      playheadRef.current = ((now - startedAtRef.current) / 1000) % DURATION;
    }

    const x = interp(playheadRef.current);
    const { rootRef, photoRefs, sceneRefs, planeRef, contrailRef,
            hudPlaceRef, hudSubRef, chipRefs, scrubRef, scrubLabelRef } = refs;

    // CSS variables on root
    const root = rootRef.current;
    if (root) {
      root.style.setProperty('--t',     x.t.toFixed(4));
      root.style.setProperty('--warm',  x.warm.toFixed(4));
      root.style.setProperty('--night', x.night.toFixed(4));
    }

    // Photo backgrounds
    if (x.p.key !== lastKeyRef.current) {
      Object.entries(photoRefs.current).forEach(([k, el]) => {
        el?.classList.toggle('photo-active', k === x.p.bg);
      });
      lastKeyRef.current = x.p.key;
      currentPhaseRef.current = x.p;
    }

    // Foreground scenes
    const want = new Set(x.p.fg);
    Object.entries(sceneRefs.current).forEach(([k, el]) => {
      el?.classList.toggle('scene-active', want.has(k));
    });

    // Plane visibility
    const showPlane = x.p.plane;
    if (planeRef.current) planeRef.current.style.display = showPlane ? 'block' : 'none';
    if (contrailRef.current) contrailRef.current.style.display = showPlane ? 'block' : 'none';

    // HUD
    if (hudPlaceRef.current) hudPlaceRef.current.textContent = x.p.place;
    if (hudSubRef.current) hudSubRef.current.textContent = '· ' + x.p.sub;

    // Chips
    chipRefs.current.forEach((el, i) => {
      el?.classList.toggle('chip-active', PHASES[i] === x.p);
    });

    // Scrub
    if (scrubRef.current) scrubRef.current.value = playheadRef.current.toFixed(1);
    if (scrubLabelRef.current) scrubLabelRef.current.textContent = playheadRef.current.toFixed(1) + 's';

    rafRef.current = requestAnimationFrame(applyFrame);
  }, [refs]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(applyFrame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [applyFrame]);

  const togglePlay = useCallback(() => {
    playingRef.current = !playingRef.current;
    if (playingRef.current) {
      startedAtRef.current = performance.now() - playheadRef.current * 1000;
    }
    const btn = refs.playBtnRef.current;
    if (btn) {
      btn.textContent = playingRef.current ? 'Pause' : 'Play';
      btn.classList.toggle('dev-btn-on', playingRef.current);
    }
  }, [refs.playBtnRef]);

  const seek = useCallback((t: number) => {
    playheadRef.current = t;
    startedAtRef.current = performance.now() - t * 1000;
  }, []);

  const jumpToPhase = useCallback((phase: Phase) => {
    seek(phase.s + 0.2);
  }, [seek]);

  const pauseForScrub = useCallback(() => {
    playingRef.current = false;
    const btn = refs.playBtnRef.current;
    if (btn) {
      btn.textContent = 'Play';
      btn.classList.remove('dev-btn-on');
    }
  }, [refs.playBtnRef]);

  return { togglePlay, seek, jumpToPhase, pauseForScrub };
}

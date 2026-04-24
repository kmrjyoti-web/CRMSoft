"use client";

import { useMemo } from "react";

import {
  getPhaseImages,
  getEventPhase,
  type TimePeriod,
} from "../utils/time-utils";

// ── Orb color map ────────────────────────────────────────
const ORB_CLASSES: Record<TimePeriod, [string, string]> = {
  morning:   ["tod-orb-morning-a",   "tod-orb-morning-b"],
  working:   ["tod-orb-working-a",   "tod-orb-working-b"],
  afternoon: ["tod-orb-afternoon-a", "tod-orb-afternoon-b"],
  evening:   ["tod-orb-evening-a",   "tod-orb-evening-b"],
  night:     ["tod-orb-night-a",     "tod-orb-night-b"],
};

// ── Component ────────────────────────────────────────────

interface AnimatedBackgroundProps {
  period: TimePeriod;
}

export default function AnimatedBackground({ period }: AnimatedBackgroundProps) {
  const event = useMemo(() => getEventPhase(), []);
  const images = useMemo(() => getPhaseImages(period, event), [period, event]);
  const [orbA, orbB] = ORB_CLASSES[period];

  const isDayPhase = period === "working" || period === "afternoon";
  const isNightPhase = period === "night" || period === "evening";

  return (
    <div
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {/* Layer 1: Gradient base */}
      <div className={`absolute inset-0 tod-bg-gradient-${period}`} />

      {/* Layer 2: Background images */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={images.primary}
        alt=""
        className="absolute inset-0 tod-bg-img tod-bg-img--primary"
        loading="eager"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={images.secondary}
        alt=""
        className="absolute inset-0 tod-bg-img tod-bg-img--secondary"
        loading="lazy"
      />

      {/* Layer 3: Texture overlay */}
      <div className="absolute inset-0 tod-texture" />

      {/* Layer 4: Ambient orbs */}
      <div className={`tod-orb tod-orb--a ${orbA}`} />
      <div className={`tod-orb tod-orb--b ${orbB}`} />

      {/* Layer 5: Phase-specific animations */}

      {/* ── Morning: Flying birds ── */}
      {period === "morning" && (
        <div className="absolute inset-0 overflow-hidden">
          {[12, 22, 34, 18, 42].map((top, i) => (
            <div
              key={i}
              className="tod-bird"
              style={{
                top: `${top}%`,
                transform: `scale(${1 - i * 0.1})`,
                animation: `tod-bird-fly ${18 + i * 3}s linear infinite`,
                animationDelay: `${i * 3}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* ── Day: Data particles + clouds + circuit glow ── */}
      {isDayPhase && (
        <div className="absolute inset-0 overflow-hidden">
          {/* Text particles */}
          {["CRM", "API", "</>", "DATA", "SYNC", "AI"].map((text, i) => (
            <span
              key={text}
              className="tod-data-particle"
              style={{
                left: `${8 + i * 16}%`,
                animation: `tod-particle-rise ${4 + i * 0.8}s linear infinite`,
                animationDelay: `${i * 0.6}s`,
              }}
            >
              {text}
            </span>
          ))}

          {/* Cloud icons */}
          {[10, 35, 58].map((top, i) => (
            <div
              key={i}
              className="tod-cloud-icon"
              style={{
                top: `${top}%`,
                animation: `tod-cloud-drift ${20 + i * 5}s linear infinite`,
                animationDelay: `${i * 4}s`,
              }}
            />
          ))}

          {/* Circuit glow */}
          <div
            className="absolute inset-0 tod-circuit"
            style={{ animation: "tod-circuit-pulse 7s ease-in-out infinite" }}
          />
        </div>
      )}

      {/* ── Evening / Night: Stars + shooting star + aurora ── */}
      {isNightPhase && (
        <div className="absolute inset-0 overflow-hidden">
          {/* Stars */}
          {[
            { top: 15, left: 25, dur: 1.5, delay: 0 },
            { top: 35, left: 85, dur: 2,   delay: 0.5 },
            { top: 55, left: 15, dur: 1,   delay: 1 },
            { top: 75, left: 65, dur: 2.5, delay: 0.2 },
            { top: 22, left: 55, dur: 1.8, delay: 0.8 },
            { top: 85, left: 92, dur: 2.2, delay: 0.4 },
          ].map((s, i) => (
            <div
              key={i}
              className="tod-star"
              style={{
                top: `${s.top}%`,
                left: `${s.left}%`,
                animation: `tod-twinkle ${s.dur}s ease-in-out infinite`,
                animationDelay: `${s.delay}s`,
              }}
            />
          ))}

          {/* Shooting star */}
          <div
            className="tod-shooting-star"
            style={{
              top: "10%",
              right: "10%",
              animation: "tod-shoot 7s ease-out infinite",
            }}
          />

          {/* Aurora */}
          <div
            className="absolute inset-0 tod-aurora"
            style={{ animation: "tod-aurora-sway 12s ease-in-out infinite" }}
          />
        </div>
      )}
    </div>
  );
}

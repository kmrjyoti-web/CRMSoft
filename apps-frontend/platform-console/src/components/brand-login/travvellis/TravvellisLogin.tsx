'use client';

import { useState, useMemo } from 'react';
import { useAnimationTimeline } from './useAnimationTimeline';
import { TRAVEL_PHASES, lerpColor } from './constants';
import { useAuth } from '../../../hooks/auth/useAuth';
import styles from './travvellis.module.css';

const LANDMARKS = ['🗼', '🏯', '🗽', '🏛️', '🕌', '🗿', '🏔️'];

type Props = {
  brandName?: string;
  onSuccess?: () => void;
};

export default function TravvellisLogin({ brandName = 'Travvellis', onSuccess }: Props) {
  const { phaseIndex, phaseProgress, totalProgress } = useAnimationTimeline();
  const { signIn, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const phase = TRAVEL_PHASES[phaseIndex];
  const nextPhase = TRAVEL_PHASES[(phaseIndex + 1) % TRAVEL_PHASES.length];

  const skyColor = useMemo(
    () => lerpColor(phase.skyStart, nextPhase.skyStart, phaseProgress),
    [phase.skyStart, nextPhase.skyStart, phaseProgress],
  );
  const skyColorEnd = useMemo(
    () => lerpColor(phase.skyEnd, nextPhase.skyEnd, phaseProgress),
    [phase.skyEnd, nextPhase.skyEnd, phaseProgress],
  );
  const accentColor = useMemo(
    () => lerpColor(phase.accentColor, nextPhase.accentColor, phaseProgress),
    [phase.accentColor, nextPhase.accentColor, phaseProgress],
  );

  const isNight = phaseIndex >= 5; // dusk_transit or night_rest
  const planeLeft = `${10 + totalProgress * 80}%`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await signIn(email, password);
      onSuccess?.();
    } catch {
      setError('Invalid credentials. Please try again.');
    }
  }

  return (
    <div
      className={styles.root}
      style={{ background: `linear-gradient(to bottom, ${skyColor}, ${skyColorEnd})` }}
    >
      {/* animated sky */}
      <div
        className={styles.sky}
        style={{ background: `linear-gradient(160deg, ${skyColor} 0%, ${skyColorEnd} 100%)` }}
      />

      {/* stars (fade in at night) */}
      <div
        className={styles.stars}
        style={{ opacity: isNight ? 0.9 : phaseIndex === 4 ? 0.3 : 0 }}
      />

      {/* animated plane */}
      <div className={styles.plane} style={{ left: planeLeft }}>
        ✈
      </div>

      {/* passport card */}
      <div className={styles.card}>
        {/* top accent strip */}
        <div
          className={styles.coverStrip}
          style={{ background: `linear-gradient(90deg, ${accentColor}, ${skyColor})` }}
        />

        {/* progress bar */}
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{
              width: `${totalProgress * 100}%`,
              background: accentColor,
            }}
          />
        </div>

        <div className={styles.cardInner}>
          {/* passport header */}
          <div className={styles.passportHeader}>
            <div className={styles.passportEmblem} style={{ borderColor: accentColor }}>
              🌍
            </div>
            <div className={styles.passportTitle}>
              <div className={styles.passportBrandName}>{brandName}</div>
              <div className={styles.passportDoc}>BOARDING PASS</div>
            </div>
            <div className={styles.stamp} style={{ color: accentColor, borderColor: accentColor }}>
              <span className={styles.stampTime}>{phase.timeLabel}</span>
              <span style={{ marginTop: 3 }}>{phase.stampText}</span>
            </div>
          </div>

          {/* photo row — landmark stamps */}
          <div className={styles.photoRow}>
            {TRAVEL_PHASES.slice(0, 7).map((p, i) => (
              <div
                key={p.id}
                className={`${styles.photoSlot} ${i === phaseIndex ? styles.active : ''}`}
                style={
                  i === phaseIndex
                    ? { background: `${accentColor}22`, borderColor: accentColor }
                    : {}
                }
              >
                <div className={styles.photoLandmark}>{LANDMARKS[i]}</div>
                <div className={styles.photoLabel}>{p.timeLabel}</div>
              </div>
            ))}
          </div>

          {/* divider */}
          <div className={styles.divider}>
            <span className={styles.dividerLabel}>{phase.label}</span>
          </div>

          {/* login form */}
          <form onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel} htmlFor="tv-email">
                Traveller ID / Email
              </label>
              <input
                id="tv-email"
                className={styles.input}
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel} htmlFor="tv-password">
                Access Code
              </label>
              <input
                id="tv-password"
                className={styles.input}
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <p style={{ color: '#f87171', fontSize: 12, marginBottom: 8 }}>{error}</p>
            )}

            <button
              className={styles.submitBtn}
              type="submit"
              disabled={isLoading}
              style={{ background: accentColor }}
            >
              {isLoading ? 'Checking in…' : 'Board Now →'}
            </button>
          </form>
        </div>

        {/* MRZ strip */}
        <div className={styles.mrz}>
          <div>P&lt;IND{(brandName.toUpperCase() + '<<TRAVELLER<<').padEnd(30, '<').slice(0, 30)}</div>
          <div>{'TV'.padEnd(9, '<')}0{'IND'.padEnd(3)}{'000000'.padEnd(7)}&lt;{'M'.padEnd(1)}{'000000'.padEnd(8)}&lt;</div>
        </div>
      </div>
    </div>
  );
}

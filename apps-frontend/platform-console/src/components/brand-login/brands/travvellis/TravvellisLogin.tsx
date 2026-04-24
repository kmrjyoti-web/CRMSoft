'use client';

import { useState, useEffect, useRef, useCallback, FormEvent } from 'react';
import { PHOTOS, PHASES, DURATION, interp } from './constants';
import { Clouds } from './skyfx/Clouds';
import { Stars } from './skyfx/Stars';
import { MountainScene } from './scenes/MountainScene';
import { TrainScene } from './scenes/TrainScene';
import { BalloonsScene } from './scenes/BalloonsScene';
import { BeachScene } from './scenes/BeachScene';
import { SailScene } from './scenes/SailScene';
import { DesertScene } from './scenes/DesertScene';
import { NightScene } from './scenes/NightScene';
import styles from './travvellis.module.css';

interface Props {
  brandName?: string;
  onSuccess?: () => void;
}

export default function TravvellisLogin({ brandName = 'Travvellis', onSuccess }: Props) {
  // Form state (only React state needed — low frequency)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepOnboard, setKeepOnboard] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // DOM refs for 60fps direct manipulation (no React re-render on each frame)
  const rootRef = useRef<HTMLDivElement>(null);
  const photoRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const sceneRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const planeRef = useRef<HTMLDivElement>(null);
  const contrailRef = useRef<HTMLDivElement>(null);
  const hudPlaceRef = useRef<HTMLDivElement>(null);
  const hudSubRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const scrubRef = useRef<HTMLInputElement>(null);
  const scrubLabelRef = useRef<HTMLSpanElement>(null);
  const playBtnRef = useRef<HTMLButtonElement>(null);

  // Animation state (all via refs, no React state)
  const playingRef = useRef(true);
  const startedAtRef = useRef(performance.now());
  const playheadRef = useRef(0);
  const rafRef = useRef<number>(0);
  const lastKeyRef = useRef<string | null>(null);

  // Load fonts once
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=Courier+Prime:wght@400;700&display=swap';
    document.head.appendChild(link);
    return () => { if (document.head.contains(link)) document.head.removeChild(link); };
  }, []);

  // Main animation frame loop — direct DOM manipulation, no React re-renders
  const frame = useCallback((now: number) => {
    if (playingRef.current) {
      playheadRef.current = ((now - startedAtRef.current) / 1000) % DURATION;
    }

    const x = interp(playheadRef.current);

    // CSS variables on root (cascade to all descendants)
    const root = rootRef.current;
    if (root) {
      root.style.setProperty('--t',     x.t.toFixed(4));
      root.style.setProperty('--warm',  x.warm.toFixed(4));
      root.style.setProperty('--night', x.night.toFixed(4));
    }

    // Photo crossfade
    if (x.p.key !== lastKeyRef.current) {
      Object.entries(photoRefs.current).forEach(([k, el]) => {
        el?.classList.toggle(styles.photoActive, k === x.p.bg);
      });
      lastKeyRef.current = x.p.key;
    }

    // Foreground scene visibility
    const want = new Set(x.p.fg);
    Object.entries(sceneRefs.current).forEach(([k, el]) => {
      el?.classList.toggle(styles.sceneActive, want.has(k));
    });

    // Plane / contrail
    const showPlane = x.p.plane;
    if (planeRef.current) planeRef.current.style.display = showPlane ? 'block' : 'none';
    if (contrailRef.current) contrailRef.current.style.display = showPlane ? 'block' : 'none';

    // HUD
    if (hudPlaceRef.current) hudPlaceRef.current.textContent = x.p.place;
    if (hudSubRef.current) hudSubRef.current.textContent = '· ' + x.p.sub;

    // Chip active highlight
    chipRefs.current.forEach((el, i) => {
      el?.classList.toggle(styles.chipActive, PHASES[i] === x.p);
    });

    // Scrub control
    if (scrubRef.current) scrubRef.current.value = playheadRef.current.toFixed(1);
    if (scrubLabelRef.current) scrubLabelRef.current.textContent = playheadRef.current.toFixed(1) + 's';

    rafRef.current = requestAnimationFrame(frame);
  }, []);

  useEffect(() => {
    // Set first photo active immediately
    if (photoRefs.current['mountain']) {
      photoRefs.current['mountain'].classList.add(styles.photoActive);
      lastKeyRef.current = 'mountain';
    }
    // Set first scene active
    if (sceneRefs.current['mountain']) {
      sceneRefs.current['mountain'].classList.add(styles.sceneActive);
    }
    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [frame]);

  // Dev controls
  const handleTogglePlay = useCallback(() => {
    playingRef.current = !playingRef.current;
    if (playingRef.current) {
      startedAtRef.current = performance.now() - playheadRef.current * 1000;
    }
    if (playBtnRef.current) {
      playBtnRef.current.textContent = playingRef.current ? 'Pause' : 'Play';
      playBtnRef.current.classList.toggle(styles.devBtnOn, playingRef.current);
    }
  }, []);

  const handleScrubDown = useCallback(() => {
    playingRef.current = false;
    if (playBtnRef.current) {
      playBtnRef.current.textContent = 'Play';
      playBtnRef.current.classList.remove(styles.devBtnOn);
    }
  }, []);

  const handleScrubInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const t = parseFloat(e.target.value);
    playheadRef.current = t;
    startedAtRef.current = performance.now() - t * 1000;
  }, []);

  const handleChipClick = useCallback((phaseS: number) => {
    const t = phaseS + 0.2;
    playheadRef.current = t;
    startedAtRef.current = performance.now() - t * 1000;
  }, []);

  // Login form submit
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';
      const res = await fetch(`${API}/auth/travel/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Brand-Code': 'travvellis' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        onSuccess?.();
      } else {
        setError('Invalid credentials. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      ref={rootRef}
      className={styles.root}
      style={{ '--t': '0.25', '--warm': '0.7', '--night': '0.25' } as React.CSSProperties}
    >
      {/* ── Photo backgrounds ── */}
      <div className={styles.photos}>
        {Object.entries(PHOTOS).map(([key, url]) => (
          <div
            key={key}
            ref={(el) => { photoRefs.current[key] = el; }}
            className={styles.photo}
            style={{
              backgroundImage: `url("${url}")`,
              animationDelay: `-${(key.charCodeAt(0) % 20)}s`,
            }}
          />
        ))}
      </div>

      {/* ── Grading overlays ── */}
      <div className={styles.darken} />
      <div className={styles.grade} />

      {/* ── Sky FX layer ── */}
      <div className={styles.skyFx}>
        <div className={`${styles.orbit} ${styles.sunOrbit}`}>
          <div className={styles.sun} />
        </div>
        <div className={`${styles.orbit} ${styles.moonOrbit}`}>
          <div className={styles.moon} />
        </div>
        <Clouds />
        <Stars />
        <div className={styles.shooting} />
        {/* Contrail — visibility toggled via ref */}
        <div ref={contrailRef} className={styles.contrail} style={{ display: 'block' }} />
        {/* Plane — visibility toggled via ref */}
        <div ref={planeRef} className={styles.plane} style={{ display: 'block' }}>
          <svg viewBox="0 0 80 40">
            <path
              d="M4 20 L30 14 L44 2 L50 2 L44 16 L62 14 L72 8 L76 10 L66 22 L72 32 L68 34 L58 28 L44 26 L50 38 L44 38 L30 26 L4 22 Z"
              fill="rgba(250,250,250,.95)"
              stroke="rgba(0,0,0,.2)"
              strokeWidth=".5"
            />
          </svg>
        </div>
        <div className={styles.vignette} />
      </div>

      {/* ── Foreground scenes ── */}
      <div className={styles.foreground}>
        <MountainScene sceneRef={(el) => { sceneRefs.current['mountain'] = el; }} />
        <TrainScene    sceneRef={(el) => { sceneRefs.current['train'] = el; }} />
        <BalloonsScene sceneRef={(el) => { sceneRefs.current['balloons'] = el; }} />
        <BeachScene    sceneRef={(el) => { sceneRefs.current['beach'] = el; }} />
        <SailScene     sceneRef={(el) => { sceneRefs.current['sail'] = el; }} />
        <DesertScene   sceneRef={(el) => { sceneRefs.current['desert'] = el; }} />
        <NightScene    sceneRef={(el) => { sceneRefs.current['night'] = el; }} />
      </div>

      {/* ── HUD ── */}
      <div className={styles.hud}>
        <div className={styles.hudDot} />
        <div ref={hudPlaceRef} className={styles.hudPlace}>Swiss Alps</div>
        <div ref={hudSubRef} className={styles.hudSub}>· Dawn Trek</div>
      </div>

      {/* ── Dev controls ── */}
      <div className={styles.dev}>
        <span className={styles.devLabel}>Dev</span>
        <button
          ref={playBtnRef}
          className={`${styles.devBtn} ${styles.devBtnOn}`}
          type="button"
          onClick={handleTogglePlay}
        >
          Pause
        </button>
        <input
          ref={scrubRef}
          className={styles.devScrub}
          type="range"
          min={0}
          max={100}
          step={0.1}
          defaultValue={0}
          onPointerDown={handleScrubDown}
          onChange={handleScrubInput}
        />
        <span ref={scrubLabelRef} className={styles.devLabel2}>0.0s</span>
      </div>

      {/* ── Scene chips ── */}
      <div className={styles.chips}>
        {PHASES.map((p, i) => (
          <button
            key={p.key}
            ref={(el) => { chipRefs.current[i] = el; }}
            className={styles.chip}
            type="button"
            onClick={() => handleChipClick(p.s)}
          >
            {p.place}
          </button>
        ))}
      </div>

      {/* ── Passport card ── */}
      <div className={styles.cardWrap}>
        <form className={styles.passport} onSubmit={handleSubmit}>
          <div className={`${styles.stamp} ${styles.stamp1}`}>✈ PARIS · CDG</div>
          <div className={`${styles.stamp} ${styles.stamp2}`}>◉ TOKYO · HND</div>
          <div className={`${styles.stamp} ${styles.stamp3}`}>◈ CAIRO · CAI</div>

          <div className={styles.emblem}>
            <div className={styles.emblemCircle}>
              <svg viewBox="0 0 24 24">
                <path d="M12 2 L15 9 L22 9 L16.5 13.5 L18.5 21 L12 16.5 L5.5 21 L7.5 13.5 L2 9 L9 9 Z" />
              </svg>
            </div>
          </div>

          <div className={styles.pspTitle}>TRAVVELLIS</div>
          <div className={styles.pspSubtitle}>Travel Passport · Global Access</div>
          <div className={styles.pspHr} />

          <div className={styles.pspWelcome}>Welcome <em>traveler</em></div>
          <div className={styles.pspSub}>&gt; Please present your credentials</div>

          {error && <div className={styles.errorBox}>{error}</div>}

          <div className={styles.pspField}>
            <label htmlFor="tv-email">Passport № / Email</label>
            <input
              id="tv-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="traveler@world.com"
              autoComplete="email"
              required
            />
          </div>

          <div className={styles.pspField}>
            <label htmlFor="tv-password">Access Code</label>
            <input
              id="tv-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          <div className={styles.pspRow}>
            <label>
              <input
                type="checkbox"
                checked={keepOnboard}
                onChange={(e) => setKeepOnboard(e.target.checked)}
              />
              Keep me onboard
            </label>
            <a href="/forgot-password">Lost code?</a>
          </div>

          <button type="submit" className={styles.pspBtn} disabled={isLoading}>
            {isLoading ? '→ Boarding...' : '→ Board Now'}
          </button>

          <div className={styles.pspDivider}>or sign in via</div>

          <div className={styles.pspSocials}>
            <button type="button" className={styles.pspSocial}>
              <svg viewBox="0 0 24 24">
                <path d="M22.5 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.99.66-2.25 1.05-3.72 1.05-2.86 0-5.29-1.93-6.15-4.53H2.17v2.84A11 11 0 0 0 12 23Z" fill="#34A853" />
                <path d="M5.85 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.35-2.1V7.06H2.17A11 11 0 0 0 1 12c0 1.78.42 3.46 1.17 4.94l3.68-2.84Z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.2 1.64l3.15-3.15C17.45 2.1 14.97 1 12 1A11 11 0 0 0 2.17 7.06l3.68 2.84C6.71 7.31 9.14 5.38 12 5.38Z" fill="#EA4335" />
              </svg>
              Google
            </button>
            <button type="button" className={styles.pspSocial}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.37 1.43c0 1.14-.47 2.27-1.22 3.08-.8.87-2.15 1.56-3.23 1.47-.14-1.09.38-2.21 1.1-2.99.8-.87 2.17-1.5 3.35-1.56ZM20 17.5c-.55 1.25-.81 1.8-1.51 2.9-1 1.57-2.4 3.53-4.15 3.54-1.55 0-1.95-1-4.05-.98-2.1.01-2.53 1-4.08.99-1.74-.02-3.07-1.78-4.07-3.36-2.79-4.4-3.08-9.55-1.36-12.3 1.22-1.94 3.15-3.08 4.96-3.08 1.85 0 3 1 4.53 1 1.48 0 2.38-1 4.52-1 1.62 0 3.34.88 4.57 2.4-4.01 2.2-3.36 7.94.64 9.89Z" />
              </svg>
              Apple
            </button>
          </div>

          <div className={styles.pspFooter}>
            First journey? <a href="/register">Request a passport →</a>
          </div>
        </form>
      </div>
    </div>
  );
}

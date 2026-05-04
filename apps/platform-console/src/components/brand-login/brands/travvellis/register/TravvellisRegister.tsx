'use client';

import { useState, useEffect, useRef, useCallback, FormEvent } from 'react';
import { PHOTOS, PHASES, DURATION, interp } from '../constants';
import { Clouds } from '../skyfx/Clouds';
import { Stars } from '../skyfx/Stars';
import { MountainScene } from '../scenes/MountainScene';
import { TrainScene } from '../scenes/TrainScene';
import { BalloonsScene } from '../scenes/BalloonsScene';
import { BeachScene } from '../scenes/BeachScene';
import { SailScene } from '../scenes/SailScene';
import { DesertScene } from '../scenes/DesertScene';
import { NightScene } from '../scenes/NightScene';
import { useRegister } from '@/hooks/auth/useRegister';
import { useCategories, useSubcategories, type FieldDef } from '@/hooks/auth/useCategories';
import parentStyles from '../travvellis.module.css';
import styles from './travvellis-register.module.css';

const CATEGORY_ICONS: Record<string, string> = {
  COMPANY_B2B: '🏢',
  COMPANY_B2C: '🏪',
  INDIVIDUAL_SP: '👤',
  CUSTOMER: '✈️',
  EMPLOYEE: '👥',
};

export default function TravvellisRegister() {
  const { register, isLoading, error } = useRegister();
  const { categories } = useCategories();
  const [step, setStep] = useState(0);
  const [categoryCode, setCategoryCode] = useState('');
  const [subcategoryCode, setSubcategoryCode] = useState('');
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [result, setResult] = useState<{ requiresApproval: boolean; message: string } | null>(null);

  const { subcategories } = useSubcategories('TRAVEL', categoryCode);
  const selectedSub = subcategories.find((s) => s.code === subcategoryCode);
  const fields: FieldDef[] = (selectedSub?.registrationFields as FieldDef[]) ?? [];

  // Animation refs (same 60fps pattern as TravvellisLogin)
  const rootRef = useRef<HTMLDivElement>(null);
  const photoRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const sceneRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const planeRef = useRef<HTMLDivElement>(null);
  const contrailRef = useRef<HTMLDivElement>(null);
  const playingRef = useRef(true);
  const startedAtRef = useRef(performance.now());
  const playheadRef = useRef(0);
  const rafRef = useRef<number>(0);
  const lastKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Inter:wght@400;500;600&family=Courier+Prime:wght@400;700&display=swap';
    document.head.appendChild(link);
    return () => { if (document.head.contains(link)) document.head.removeChild(link); };
  }, []);

  const frame = useCallback((now: number) => {
    if (playingRef.current) {
      playheadRef.current = ((now - startedAtRef.current) / 1000) % DURATION;
    }
    const x = interp(playheadRef.current);
    const root = rootRef.current;
    if (root) {
      root.style.setProperty('--t',     x.t.toFixed(4));
      root.style.setProperty('--warm',  x.warm.toFixed(4));
      root.style.setProperty('--night', x.night.toFixed(4));
    }
    if (x.p.key !== lastKeyRef.current) {
      Object.entries(photoRefs.current).forEach(([k, el]) => {
        el?.classList.toggle(parentStyles.photoActive, k === x.p.bg);
      });
      lastKeyRef.current = x.p.key;
    }
    const want = new Set(x.p.fg);
    Object.entries(sceneRefs.current).forEach(([k, el]) => {
      el?.classList.toggle(parentStyles.sceneActive, want.has(k));
    });
    if (planeRef.current) planeRef.current.style.display = x.p.plane ? 'block' : 'none';
    if (contrailRef.current) contrailRef.current.style.display = x.p.plane ? 'block' : 'none';
    rafRef.current = requestAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (photoRefs.current['mountain']) {
      photoRefs.current['mountain'].classList.add(parentStyles.photoActive);
      lastKeyRef.current = 'mountain';
    }
    if (sceneRefs.current['mountain']) {
      sceneRefs.current['mountain'].classList.add(parentStyles.sceneActive);
    }
    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [frame]);

  const canNext = () => {
    if (step === 0) return !!categoryCode;
    if (step === 1) return !!subcategoryCode;
    if (step === 2) return fields.filter((f) => f.required).every((f) => fieldValues[f.name]);
    if (step === 3) return !!email && password.length >= 8 && password === confirmPassword;
    return true;
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const res = await register({
      verticalCode: 'TRAVEL',
      categoryCode,
      subcategoryCode,
      brandCode: 'travvellis',
      email,
      password,
      registrationFields: fieldValues,
    });
    if (res.success) {
      setResult({ requiresApproval: res.requiresApproval ?? false, message: res.message ?? '' });
      setStep(4);
    }
  }

  const setField = (name: string, value: any) =>
    setFieldValues((prev) => ({ ...prev, [name]: value }));

  return (
    <div
      ref={rootRef}
      className={parentStyles.root}
      style={{ '--t': '0.25', '--warm': '0.7', '--night': '0.25' } as React.CSSProperties}
    >
      {/* Photo backgrounds */}
      <div className={parentStyles.photos}>
        {Object.entries(PHOTOS).map(([key, url]) => (
          <div
            key={key}
            ref={(el) => { photoRefs.current[key] = el; }}
            className={parentStyles.photo}
            style={{ backgroundImage: `url("${url}")`, animationDelay: `-${key.charCodeAt(0) % 20}s` }}
          />
        ))}
      </div>
      <div className={parentStyles.darken} />
      <div className={parentStyles.grade} />

      {/* Sky */}
      <div className={parentStyles.skyFx}>
        <div className={`${parentStyles.orbit} ${parentStyles.sunOrbit}`}><div className={parentStyles.sun} /></div>
        <div className={`${parentStyles.orbit} ${parentStyles.moonOrbit}`}><div className={parentStyles.moon} /></div>
        <Clouds />
        <Stars />
        <div className={parentStyles.shooting} />
        <div ref={contrailRef} className={parentStyles.contrail} style={{ display: 'block' }} />
        <div ref={planeRef} className={parentStyles.plane} style={{ display: 'block' }}>
          <svg viewBox="0 0 80 40">
            <path d="M4 20 L30 14 L44 2 L50 2 L44 16 L62 14 L72 8 L76 10 L66 22 L72 32 L68 34 L58 28 L44 26 L50 38 L44 38 L30 26 L4 22 Z" fill="rgba(250,250,250,.95)" stroke="rgba(0,0,0,.2)" strokeWidth=".5" />
          </svg>
        </div>
        <div className={parentStyles.vignette} />
      </div>

      {/* Scenes */}
      <div className={parentStyles.foreground}>
        <MountainScene sceneRef={(el) => { sceneRefs.current['mountain'] = el; }} />
        <TrainScene    sceneRef={(el) => { sceneRefs.current['train'] = el; }} />
        <BalloonsScene sceneRef={(el) => { sceneRefs.current['balloons'] = el; }} />
        <BeachScene    sceneRef={(el) => { sceneRefs.current['beach'] = el; }} />
        <SailScene     sceneRef={(el) => { sceneRefs.current['sail'] = el; }} />
        <DesertScene   sceneRef={(el) => { sceneRefs.current['desert'] = el; }} />
        <NightScene    sceneRef={(el) => { sceneRefs.current['night'] = el; }} />
      </div>

      {/* Registration wizard */}
      <div className={styles.wizard}>
        <div className={styles.card}>
          <div className={styles.title}>TRAVVELLIS</div>
          <div className={styles.subtitle}>New Passport Application</div>
          <hr className={styles.hr} />

          {/* Step dots */}
          {step < 4 && (
            <div className={styles.stepRow}>
              {[0,1,2,3].map((i) => (
                <div
                  key={i}
                  className={`${styles.dot} ${i === step ? styles.dotActive : i < step ? styles.dotDone : ''}`}
                />
              ))}
            </div>
          )}

          {/* Step 0 — Category */}
          {step === 0 && (
            <>
              <div className={styles.stepTitle}>Who are you?</div>
              <div className={styles.stepHint}>&gt; Select your traveler category</div>
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className={`${styles.catCard} ${categoryCode === cat.code ? styles.catCardSelected : ''}`}
                  onClick={() => { setCategoryCode(cat.code); setSubcategoryCode(''); setFieldValues({}); }}
                >
                  <div className={styles.catIcon}>{CATEGORY_ICONS[cat.code] ?? '◈'}</div>
                  <div>
                    <div className={styles.catName}>{cat.name}</div>
                    <div className={styles.catDesc}>{cat.description}</div>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Step 1 — Subcategory */}
          {step === 1 && (
            <>
              <div className={styles.stepTitle}>Your specific role?</div>
              <div className={styles.stepHint}>&gt; Select the role that fits you</div>
              {subcategories.length === 0 ? (
                <div style={{ opacity: .5, padding: '20px 0', textAlign: 'center', fontSize: 12 }}>
                  No roles available for this category
                </div>
              ) : subcategories.map((sub) => (
                <div
                  key={sub.id}
                  className={`${styles.catCard} ${subcategoryCode === sub.code ? styles.catCardSelected : ''}`}
                  onClick={() => setSubcategoryCode(sub.code)}
                >
                  <div className={styles.catIcon}>◇</div>
                  <div>
                    <div className={styles.catName}>{sub.name}</div>
                    <div className={styles.catDesc}>{sub.description}</div>
                    {sub.requiresApproval && (
                      <div className={styles.catDesc} style={{ color: '#d4b878', marginTop: 2 }}>
                        ⚡ Requires approval
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Step 2 — Dynamic fields */}
          {step === 2 && (
            <>
              <div className={styles.stepTitle}>Your Details</div>
              <div className={styles.stepHint}>&gt; Fill in your information</div>
              {fields.map((field) => (
                <div key={field.name} className={styles.field}>
                  <label className={styles.fieldLabel}>{field.label}{field.required ? ' *' : ''}</label>
                  {field.type === 'textarea' ? (
                    <textarea
                      rows={3}
                      className={styles.fieldTextarea}
                      value={fieldValues[field.name] ?? ''}
                      onChange={(e) => setField(field.name, e.target.value)}
                    />
                  ) : field.type === 'multiselect' ? (
                    <select
                      multiple
                      className={styles.fieldSelect}
                      style={{ height: 80 }}
                      value={fieldValues[field.name] ?? []}
                      onChange={(e) => setField(field.name, Array.from(e.target.selectedOptions).map((o) => o.value))}
                    >
                      {(field.options ?? []).map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type === 'number' ? 'number' : field.type === 'phone' ? 'tel' : 'text'}
                      className={styles.fieldInput}
                      value={fieldValues[field.name] ?? ''}
                      onChange={(e) => setField(field.name, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </>
          )}

          {/* Step 3 — Credentials */}
          {step === 3 && (
            <form onSubmit={handleSubmit}>
              <div className={styles.stepTitle}>Secure Your Passport</div>
              <div className={styles.stepHint}>&gt; Create your login credentials</div>
              {error && <div className={styles.errorBox}>{error}</div>}
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Email *</label>
                <input type="email" className={styles.fieldInput} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="traveler@world.com" required />
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Password (min 8 chars) *</label>
                <input type="password" className={styles.fieldInput} value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Confirm Password *</label>
                <input type="password" className={styles.fieldInput} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                {confirmPassword && password !== confirmPassword && (
                  <div style={{ color: '#fca5a5', fontSize: 10, marginTop: 4 }}>Passwords do not match</div>
                )}
              </div>
            </form>
          )}

          {/* Step 4 — Success */}
          {step === 4 && (
            <div className={styles.success}>
              <div className={styles.successEmoji}>✈️</div>
              <div className={styles.successTitle}>Passport Issued!</div>
              <div className={styles.successMsg}>
                {result?.requiresApproval
                  ? 'Your application is under review. We will notify you once your account is approved.'
                  : 'Your Travvellis passport has been issued! You can now sign in and start your journey.'}
              </div>
              <button className={styles.successBtn} onClick={() => { window.location.href = '/login?brand=travvellis'; }}>
                → Go to Login
              </button>
            </div>
          )}

          {/* Navigation */}
          {step < 4 && (
            <div className={styles.navRow}>
              {step > 0 && (
                <button className={styles.btnBack} type="button" onClick={() => setStep(step - 1)}>
                  ← Back
                </button>
              )}
              <button
                className={styles.btnNext}
                type="button"
                disabled={!canNext() || isLoading}
                onClick={step === 3 ? (handleSubmit as any) : () => setStep(step + 1)}
              >
                {step === 3 ? (isLoading ? 'Issuing…' : '→ Issue Passport') : 'Next →'}
              </button>
            </div>
          )}

          {step < 4 && (
            <div className={styles.footer}>
              Already have a passport?{' '}
              <a href="/login?brand=travvellis">Sign in →</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

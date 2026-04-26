'use client';

import { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, Circle, Loader2, AlertCircle, ChevronRight } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

// ── Types ─────────────────────────────────────────────────────────────────────

interface OnboardingStage {
  stageKey: string;
  stageLabel: string;
  componentName: string;
  required: boolean;
  completed: boolean;
}

interface OnboardingStatus {
  stages: OnboardingStage[];
  currentStage: string | null;
  complete: boolean;
  totalStages: number;
  combinedCode: string | null;
}

interface StageProps {
  token: string;
  accentColor: string;
  onComplete: () => void;
}

// ── API helpers ───────────────────────────────────────────────────────────────

async function apiFetch(path: string, token: string, opts: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(opts.headers ?? {}),
    },
  });
  return res.json();
}

// ── Stage: Language ───────────────────────────────────────────────────────────

const LOCALES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
  { code: 'ar', label: 'العربية' },
  { code: 'de', label: 'Deutsch' },
];

function StageLanguage({ token, accentColor, onComplete }: StageProps) {
  const [selected, setSelected] = useState('en');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch('/onboarding/locale', token, {
        method: 'POST',
        body: JSON.stringify({ locale: selected }),
      });
      if (res.success) onComplete();
      else setError(res.message ?? 'Failed to save');
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 20 }}>
        Choose your preferred language for the platform.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
        {LOCALES.map((l) => (
          <button
            key={l.code}
            onClick={() => setSelected(l.code)}
            style={{
              padding: '12px 16px',
              background: selected === l.code ? `${accentColor}22` : '#0f172a',
              border: `1px solid ${selected === l.code ? accentColor : '#334155'}`,
              borderRadius: 8,
              color: selected === l.code ? accentColor : '#94a3b8',
              fontSize: 14,
              fontWeight: selected === l.code ? 600 : 400,
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            {l.label}
          </button>
        ))}
      </div>
      {error && <ErrorBanner message={error} />}
      <PrimaryButton accentColor={accentColor} loading={loading} onClick={handleSave}>
        Continue
      </PrimaryButton>
    </div>
  );
}

// ── Stage: Email OTP ──────────────────────────────────────────────────────────

function StageEmailOtp({ token, accentColor, onComplete }: StageProps) {
  const [step, setStep] = useState<'send' | 'verify'>('send');
  const [code, setCode] = useState('');
  const [maskedTarget, setMaskedTarget] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sendOtp = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch('/onboarding/otp/send', token, {
        method: 'POST',
        body: JSON.stringify({ type: 'email' }),
      });
      if (res.success) {
        setMaskedTarget(res.data?.maskedTarget ?? '');
        setStep('verify');
      } else {
        setError(res.message ?? 'Failed to send OTP');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch('/onboarding/otp/verify', token, {
        method: 'POST',
        body: JSON.stringify({ type: 'email', code }),
      });
      if (res.success) onComplete();
      else setError(res.message ?? 'Invalid OTP');
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'send') {
    return (
      <div>
        <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 24 }}>
          We'll send a one-time code to your registered email address to verify your account.
        </p>
        {error && <ErrorBanner message={error} />}
        <PrimaryButton accentColor={accentColor} loading={loading} onClick={sendOtp}>
          Send Verification Code
        </PrimaryButton>
      </div>
    );
  }

  return (
    <div>
      <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 8 }}>
        Enter the 6-digit code sent to <strong style={{ color: '#e2e8f0' }}>{maskedTarget || 'your email'}</strong>.
      </p>
      <input
        type="text"
        inputMode="numeric"
        maxLength={6}
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
        placeholder="------"
        style={{
          width: '100%', padding: '12px 16px', background: '#0f172a', border: '1px solid #334155',
          borderRadius: 8, color: '#f1f5f9', fontSize: 22, fontWeight: 700, letterSpacing: '0.3em',
          textAlign: 'center', outline: 'none', boxSizing: 'border-box', marginBottom: 16,
        }}
      />
      {error && <ErrorBanner message={error} />}
      <PrimaryButton accentColor={accentColor} loading={loading} onClick={verifyOtp} disabled={code.length < 6}>
        Verify Email
      </PrimaryButton>
      <button
        onClick={() => { setStep('send'); setCode(''); setError(''); }}
        style={{ marginTop: 10, background: 'none', border: 'none', color: '#64748b', fontSize: 13, cursor: 'pointer', padding: 0 }}
      >
        Resend code
      </button>
    </div>
  );
}

// ── Stage: Mobile OTP ─────────────────────────────────────────────────────────

function StageMobileOtp({ token, accentColor, onComplete }: StageProps) {
  const [step, setStep] = useState<'send' | 'verify'>('send');
  const [code, setCode] = useState('');
  const [maskedTarget, setMaskedTarget] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sendOtp = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch('/onboarding/otp/send', token, {
        method: 'POST',
        body: JSON.stringify({ type: 'mobile' }),
      });
      if (res.success) {
        setMaskedTarget(res.data?.maskedTarget ?? '');
        setStep('verify');
      } else {
        setError(res.message ?? 'Failed to send OTP');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch('/onboarding/otp/verify', token, {
        method: 'POST',
        body: JSON.stringify({ type: 'mobile', code }),
      });
      if (res.success) onComplete();
      else setError(res.message ?? 'Invalid OTP');
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const skipMobile = async () => {
    setLoading(true);
    try {
      await apiFetch('/onboarding/otp/skip-mobile', token, { method: 'POST' });
      onComplete();
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {step === 'send' ? (
        <>
          <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 24 }}>
            Verify your mobile number for account security. This step is optional.
          </p>
          {error && <ErrorBanner message={error} />}
          <PrimaryButton accentColor={accentColor} loading={loading} onClick={sendOtp}>
            Send Code to Mobile
          </PrimaryButton>
          <button
            onClick={skipMobile}
            disabled={loading}
            style={{ marginTop: 10, background: 'none', border: 'none', color: '#64748b', fontSize: 13, cursor: 'pointer', display: 'block', padding: 0 }}
          >
            Skip for now
          </button>
        </>
      ) : (
        <>
          <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 8 }}>
            Enter the 6-digit code sent to <strong style={{ color: '#e2e8f0' }}>{maskedTarget || 'your mobile'}</strong>.
          </p>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            placeholder="------"
            style={{
              width: '100%', padding: '12px 16px', background: '#0f172a', border: '1px solid #334155',
              borderRadius: 8, color: '#f1f5f9', fontSize: 22, fontWeight: 700, letterSpacing: '0.3em',
              textAlign: 'center', outline: 'none', boxSizing: 'border-box', marginBottom: 16,
            }}
          />
          {error && <ErrorBanner message={error} />}
          <PrimaryButton accentColor={accentColor} loading={loading} onClick={verifyOtp} disabled={code.length < 6}>
            Verify Mobile
          </PrimaryButton>
          <button
            onClick={skipMobile}
            disabled={loading}
            style={{ marginTop: 10, background: 'none', border: 'none', color: '#64748b', fontSize: 13, cursor: 'pointer', display: 'block', padding: 0 }}
          >
            Skip for now
          </button>
        </>
      )}
    </div>
  );
}

// ── Stage: Travel Specialization ──────────────────────────────────────────────

const TRAVEL_SPECS = [
  'Luxury Travel', 'Adventure & Trekking', 'Family Holidays', 'Business Travel',
  'Honeymoon Packages', 'Group Tours', 'Cultural & Heritage', 'Wildlife Safaris',
  'Beach & Coastal', 'City Breaks', 'Medical Tourism', 'Religious Tours',
];

function StageTravelSpecialization({ token, accentColor, onComplete }: StageProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggle = (spec: string) =>
    setSelected((prev) => prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec]);

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch('/onboarding/custom-stage/travel_specialization/complete', token, {
        method: 'POST',
        body: JSON.stringify({ specializations: selected }),
      });
      if (res.success) onComplete();
      else setError(res.message ?? 'Failed to save');
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 20 }}>
        Select your travel specializations. This helps us personalise your CRM experience.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
        {TRAVEL_SPECS.map((spec) => {
          const active = selected.includes(spec);
          return (
            <button
              key={spec}
              onClick={() => toggle(spec)}
              style={{
                padding: '7px 14px',
                background: active ? `${accentColor}22` : 'transparent',
                border: `1px solid ${active ? accentColor : '#334155'}`,
                borderRadius: 20,
                color: active ? accentColor : '#64748b',
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                cursor: 'pointer',
              }}
            >
              {spec}
            </button>
          );
        })}
      </div>
      {error && <ErrorBanner message={error} />}
      <PrimaryButton accentColor={accentColor} loading={loading} onClick={handleSave}>
        {selected.length === 0 ? 'Skip' : `Save ${selected.length} Specialization${selected.length > 1 ? 's' : ''}`}
      </PrimaryButton>
    </div>
  );
}

// ── Stage: Profile Redirect ───────────────────────────────────────────────────

function StageProfileRedirect({ accentColor, onComplete }: Omit<StageProps, 'token'> & { token: string }) {
  return (
    <div>
      <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 24 }}>
        Your account is ready. Complete your profile to get the most out of the platform.
      </p>
      <PrimaryButton accentColor={accentColor} loading={false} onClick={onComplete}>
        Complete Profile <ChevronRight size={16} style={{ display: 'inline', marginLeft: 4 }} />
      </PrimaryButton>
    </div>
  );
}

// ── Stage renderer map ────────────────────────────────────────────────────────

const STAGE_COMPONENTS: Record<string, React.ComponentType<StageProps>> = {
  StageLanguage: StageLanguage,
  StageEmailOtp: StageEmailOtp,
  StageMobileOtp: StageMobileOtp,
  StageTravelSpecialization: StageTravelSpecialization,
  StageProfileRedirect: StageProfileRedirect,
};

// ── Shared micro-components ───────────────────────────────────────────────────

function ErrorBanner({ message }: { message: string }) {
  return (
    <div style={{ background: '#450a0a', border: '1px solid #991b1b', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#fca5a5', display: 'flex', alignItems: 'center', gap: 8 }}>
      <AlertCircle size={14} />{message}
    </div>
  );
}

function PrimaryButton({
  children, accentColor, loading, onClick, disabled,
}: {
  children: React.ReactNode;
  accentColor: string;
  loading: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      style={{
        width: '100%', padding: '11px', background: (loading || disabled) ? '#475569' : accentColor,
        color: '#0f172a', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700,
        cursor: (loading || disabled) ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}
    >
      {loading ? <><Loader2 size={14} className="animate-spin" />Working…</> : children}
    </button>
  );
}

// ── Progress bar ──────────────────────────────────────────────────────────────

function ProgressBar({ stages, accentColor }: { stages: OnboardingStage[]; accentColor: string }) {
  return (
    <div style={{ display: 'flex', gap: 4, marginBottom: 28 }}>
      {stages.map((s, i) => (
        <div
          key={s.stageKey}
          title={s.stageLabel}
          style={{
            flex: 1, height: 4, borderRadius: 2,
            background: s.completed
              ? accentColor
              : stages.findIndex((x) => !x.completed) === i
                ? `${accentColor}66`
                : '#1e293b',
          }}
        />
      ))}
    </div>
  );
}

// ── Main wizard ───────────────────────────────────────────────────────────────

interface Props {
  token: string;
  brand: string;
  accentColor?: string;
  logoText?: string;
  onDone?: () => void;
}

export default function DynamicOnboardingWizard({
  token,
  brand,
  accentColor = '#58a6ff',
  logoText = 'CRMSoft',
  onDone,
}: Props) {
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [fetchError, setFetchError] = useState('');

  const loadStatus = useCallback(async () => {
    setFetchError('');
    try {
      const res = await apiFetch('/onboarding/status-v2', token);
      if (res.success) {
        setStatus(res.data);
      } else {
        setFetchError(res.message ?? 'Failed to load onboarding status');
      }
    } catch {
      setFetchError('Network error — is the API running?');
    }
  }, [token]);

  useEffect(() => { loadStatus(); }, [loadStatus]);

  const handleStageComplete = () => loadStatus();

  if (!status) {
    return (
      <Shell accentColor={accentColor} logoText={logoText}>
        {fetchError ? (
          <ErrorBanner message={fetchError} />
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
            <Loader2 size={24} className="animate-spin" style={{ color: accentColor }} />
          </div>
        )}
      </Shell>
    );
  }

  if (status.complete) {
    return (
      <Shell accentColor={accentColor} logoText={logoText}>
        <div style={{ textAlign: 'center', padding: '16px 0 8px' }}>
          <CheckCircle2 size={48} style={{ color: accentColor, marginBottom: 16 }} />
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9', margin: '0 0 8px' }}>
            You're all set!
          </h2>
          <p style={{ fontSize: 14, color: '#64748b', marginBottom: 28 }}>
            Your account is fully configured.
          </p>
          <button
            onClick={() => onDone?.()}
            style={{
              width: '100%', padding: 11, background: accentColor, color: '#0f172a',
              border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer',
            }}
          >
            Go to Dashboard
          </button>
        </div>
      </Shell>
    );
  }

  const currentStage = status.stages.find((s) => s.stageKey === status.currentStage);
  if (!currentStage) {
    return (
      <Shell accentColor={accentColor} logoText={logoText}>
        <ErrorBanner message="No active stage found. Please contact support." />
      </Shell>
    );
  }

  const StageComponent = STAGE_COMPONENTS[currentStage.componentName];

  return (
    <Shell accentColor={accentColor} logoText={logoText}>
      <ProgressBar stages={status.stages} accentColor={accentColor} />

      <div style={{ marginBottom: 6 }}>
        <p style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: accentColor, fontWeight: 600, margin: '0 0 4px' }}>
          Step {status.stages.filter((s) => s.completed).length + 1} of {status.totalStages}
        </p>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', margin: '0 0 20px' }}>
          {currentStage.stageLabel}
        </h2>
      </div>

      {StageComponent ? (
        <StageComponent token={token} accentColor={accentColor} onComplete={handleStageComplete} />
      ) : (
        <div style={{ color: '#64748b', fontSize: 14 }}>
          Unknown stage: {currentStage.componentName}
        </div>
      )}

      <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {status.stages.map((s) => (
            <div key={s.stageKey} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
              {s.completed
                ? <CheckCircle2 size={12} style={{ color: accentColor }} />
                : <Circle size={12} style={{ color: s.stageKey === status.currentStage ? accentColor : '#334155' }} />}
              <span style={{ color: s.completed ? accentColor : s.stageKey === status.currentStage ? '#e2e8f0' : '#475569' }}>
                {s.stageLabel}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}

// ── Shell wrapper ─────────────────────────────────────────────────────────────

function Shell({ children, accentColor, logoText }: { children: React.ReactNode; accentColor: string; logoText: string }) {
  return (
    <div style={{ minHeight: '100dvh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: '36px 32px', width: '100%', maxWidth: 480 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <p style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: accentColor, fontWeight: 600, margin: '0 0 4px' }}>
            {logoText}
          </p>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>Account Setup</h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>Complete a few quick steps</p>
        </div>
        {children}
      </div>
    </div>
  );
}

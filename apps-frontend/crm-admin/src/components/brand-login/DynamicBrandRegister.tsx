'use client';

/**
 * DynamicBrandRegister — M4 config-driven registration
 *
 * Replaces per-brand hardcoded registration forms.
 * Reads field definitions from /api/v1/pc-config/registration-form?combinedCode=...
 * Submits to /api/v1/auth/register-dynamic
 *
 * Same component, different form per brand — driven entirely by pc_registration_field table.
 */

import { useState, useEffect, useCallback, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useBrandContext } from '@/hooks/auth/useBrandContext';
import { useRegisterDynamic } from '@/hooks/auth/useRegisterDynamic';
import api from '@/services/api-client';

// ── Types ──────────────────────────────────────────────────────────────────

interface Vertical {
  id: string;
  typeCode: string;
  typeName: string;
  sortOrder: number;
}

interface SubType {
  id: string;
  code: string;
  shortCode: string;
  name: string;
  userType: string;
  sortOrder: number;
}

interface CombinedCode {
  id: string;
  code: string;
  userType: string;
  subTypeId: string;
  displayName: string;
  isActive: boolean;
}

interface FieldDef {
  id: string;
  fieldKey: string;
  fieldType: string;
  label: string;
  placeholder?: string;
  helpText?: string;
  required: boolean;
  options?: { value: string; label: string }[];
  validation?: { pattern?: string; message?: string };
  sortOrder: number;
}

// ── Constants ─────────────────────────────────────────────────────────────

const USER_TYPES = [
  { code: 'B2B', label: 'Business (B2B)', desc: 'Sell to other businesses' },
  { code: 'B2C', label: 'Business (B2C)', desc: 'Sell to end consumers' },
  { code: 'IND_SP', label: 'Service Provider', desc: 'Individual professional' },
  { code: 'IND_EE', label: 'Employee / Job seeker', desc: 'Looking for opportunities' },
];

type Step = 'cascade' | 'fields' | 'credentials' | 'success';

// ── Helpers ────────────────────────────────────────────────────────────────

function fetchJson<T>(path: string): Promise<T[]> {
  return api.get<any>(path)
    .then(({ data }) => {
      const payload = data?.data ?? data;
      return Array.isArray(payload) ? payload : [];
    })
    .catch(() => []);
}

// ── Subcomponents ──────────────────────────────────────────────────────────

function StepDots({ current }: { current: Step }) {
  const order: Step[] = ['cascade', 'fields', 'credentials', 'success'];
  const idx = order.indexOf(current);
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 20 }}>
      {order.slice(0, 3).map((s, i) => (
        <div key={s} style={{
          width: 8, height: 8, borderRadius: '50%',
          background: i <= idx ? 'var(--color-primary, #b8894a)' : 'rgba(255,255,255,0.2)',
          transition: 'background 0.3s',
        }} />
      ))}
    </div>
  );
}

interface FieldInputProps {
  field: FieldDef;
  value: any;
  onChange: (v: any) => void;
}

function FieldInput({ field, value, onChange }: FieldInputProps) {
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px', borderRadius: 8,
    border: '1.5px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)',
    color: '#f1f5f9', fontSize: 13, outline: 'none', boxSizing: 'border-box',
  };

  if (field.fieldType === 'textarea') {
    return (
      <textarea
        rows={3}
        style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
        placeholder={field.placeholder ?? ''}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  if (field.fieldType === 'multiselect' && Array.isArray(field.options)) {
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {field.options.map((opt) => {
          const selected = (value ?? []).includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              style={{
                padding: '5px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                border: `1.5px solid ${selected ? 'var(--color-primary, #b8894a)' : 'rgba(255,255,255,0.2)'}`,
                background: selected ? 'rgba(184,137,74,0.2)' : 'transparent',
                color: selected ? 'var(--color-primary, #b8894a)' : '#94a3b8',
                transition: 'all 0.2s',
              }}
              onClick={() => {
                const cur: string[] = value ?? [];
                onChange(cur.includes(opt.value) ? cur.filter((v) => v !== opt.value) : [...cur, opt.value]);
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    );
  }

  if (field.fieldType === 'select' && Array.isArray(field.options)) {
    return (
      <select
        style={{ ...inputStyle, cursor: 'pointer' }}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select…</option>
        {field.options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    );
  }

  const typeMap: Record<string, string> = {
    email: 'email', phone: 'tel', number: 'number', password: 'password',
  };

  return (
    <input
      type={typeMap[field.fieldType] ?? 'text'}
      style={inputStyle}
      placeholder={field.placeholder ?? ''}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function DynamicBrandRegister() {
  const router = useRouter();
  const { brandCode, buildBrandUrl } = useBrandContext();
  const { registerDynamic, isLoading, error } = useRegisterDynamic();

  // ── Cascade state ──
  const [verticals, setVerticals] = useState<Vertical[]>([]);
  const [subTypes, setSubTypes] = useState<SubType[]>([]);
  const [combinedCodes, setCombinedCodes] = useState<CombinedCode[]>([]);

  const [selectedVertical, setSelectedVertical] = useState<Vertical | null>(null);
  const [selectedUserType, setSelectedUserType] = useState('');
  const [selectedSubType, setSelectedSubType] = useState<SubType | null>(null);
  const [resolvedCode, setResolvedCode] = useState<CombinedCode | null>(null);

  // ── Form state ──
  const [step, setStep] = useState<Step>('cascade');
  const [fields, setFields] = useState<FieldDef[]>([]);
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [result, setResult] = useState<{ requiresApproval: boolean; message: string } | null>(null);

  // ── Load verticals on mount ──
  useEffect(() => {
    fetchJson<Vertical>('/api/v1/pc-config/verticals').then(setVerticals);
  }, []);

  // ── Load combined codes whenever brand is known ──
  useEffect(() => {
    if (!brandCode) return;
    fetchJson<CombinedCode>(`/api/v1/pc-config/combined-codes?brandCode=${brandCode}`)
      .then(setCombinedCodes);
  }, [brandCode]);

  // ── Load sub-types when vertical + userType selected ──
  useEffect(() => {
    if (!selectedVertical || !selectedUserType) { setSubTypes([]); setSelectedSubType(null); return; }
    fetchJson<SubType>(
      `/api/v1/pc-config/sub-types?vertical=${selectedVertical.typeCode}&userType=${selectedUserType}`,
    ).then(setSubTypes);
    setSelectedSubType(null);
    setResolvedCode(null);
  }, [selectedVertical, selectedUserType]);

  // ── Resolve combined code when all cascade is complete ──
  useEffect(() => {
    if (!selectedSubType || !selectedUserType || combinedCodes.length === 0) {
      setResolvedCode(null);
      return;
    }
    const match = combinedCodes.find(
      (cc) => cc.userType === selectedUserType && cc.subTypeId === selectedSubType.id,
    );
    setResolvedCode(match ?? null);
  }, [selectedSubType, selectedUserType, combinedCodes]);

  // ── Load fields when combined code resolved ──
  const loadFields = useCallback(async (code: string) => {
    const raw = await fetchJson<FieldDef>(`/api/v1/pc-config/registration-form?combinedCode=${code}`);
    setFields(raw);
    setFieldValues({});
    setStep('fields');
  }, []);

  const setField = (key: string, val: any) =>
    setFieldValues((prev) => ({ ...prev, [key]: val }));

  // ── Validation helpers ──
  const cascadeComplete = !!(selectedVertical && selectedUserType && selectedSubType && resolvedCode);
  const requiredFieldsMet = fields.filter((f) => f.required).every((f) => {
    const v = fieldValues[f.fieldKey];
    return v !== undefined && v !== '' && (Array.isArray(v) ? v.length > 0 : true);
  });
  const credentialsValid = email.trim() && password.length >= 8 && password === confirmPassword;

  // ── Submit ──
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!resolvedCode || !selectedVertical || !selectedSubType) return;

    const res = await registerDynamic({
      combinedCode: resolvedCode.code,
      brandCode: brandCode ?? 'default',
      verticalCode: selectedVertical.typeCode,
      userType: selectedUserType,
      subTypeCode: selectedSubType.code,
      email,
      password,
      mobile: fieldValues.mobile,
      fields: { ...fieldValues, email },
    });

    if (res.success) {
      if (!res.requiresApproval && res.accessToken) {
        router.push('/dashboard');
      } else {
        setResult({
          requiresApproval: res.requiresApproval ?? false,
          message: res.message ?? 'Registration submitted.',
        });
        setStep('success');
      }
    }
  }

  // ── UI ─────────────────────────────────────────────────────────────────

  const card: React.CSSProperties = {
    background: 'rgba(15, 20, 32, 0.92)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 16,
    padding: '36px 32px',
    width: '100%',
    maxWidth: 480,
    backdropFilter: 'blur(20px)',
    boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
  };

  const label: React.CSSProperties = {
    fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
    textTransform: 'uppercase', color: 'rgba(148,163,184,0.8)', marginBottom: 6, display: 'block',
  };

  const choiceBtn = (selected: boolean): React.CSSProperties => ({
    padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${selected ? 'var(--color-primary, #b8894a)' : 'rgba(255,255,255,0.12)'}`,
    background: selected ? 'rgba(184,137,74,0.15)' : 'rgba(255,255,255,0.04)',
    color: selected ? 'var(--color-primary, #b8894a)' : '#94a3b8',
    textAlign: 'left' as const, cursor: 'pointer', transition: 'all 0.2s', width: '100%',
  });

  const primaryBtn = (disabled: boolean): React.CSSProperties => ({
    width: '100%', padding: '11px 0', borderRadius: 10,
    background: disabled ? 'rgba(255,255,255,0.08)' : 'var(--color-primary, #b8894a)',
    color: disabled ? 'rgba(255,255,255,0.3)' : '#fff',
    border: 'none', fontSize: 14, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s', marginTop: 20,
  });

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px', borderRadius: 8,
    border: '1.5px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)',
    color: '#f1f5f9', fontSize: 13, outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a0d1a 0%, #1a1f2e 100%)',
      padding: '40px 20px', fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={card}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--color-primary, #b8894a)', fontWeight: 600, marginBottom: 4 }}>
            {brandCode?.toUpperCase() ?? 'CREATE ACCOUNT'}
          </p>
          <h2 style={{ fontSize: 22, fontWeight: 600, color: '#f1f5f9', margin: 0, lineHeight: 1.3 }}>
            {step === 'cascade' ? 'Choose your profile' :
             step === 'fields' ? resolvedCode?.displayName ?? 'Your Details' :
             step === 'credentials' ? 'Secure your account' :
             'Registration complete'}
          </h2>
        </div>

        {step !== 'success' && <StepDots current={step} />}

        {/* ── STEP: CASCADE ── */}
        {step === 'cascade' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Vertical selector */}
            <div>
              <span style={label}>Industry</span>
              <select
                style={{ ...inputStyle, cursor: 'pointer' }}
                value={selectedVertical?.typeCode ?? ''}
                onChange={(e) => {
                  const v = verticals.find((x) => x.typeCode === e.target.value) ?? null;
                  setSelectedVertical(v);
                  setSelectedUserType('');
                  setSelectedSubType(null);
                }}
              >
                <option value="">Select industry…</option>
                {verticals.map((v) => (
                  <option key={v.typeCode} value={v.typeCode}>{v.typeName}</option>
                ))}
              </select>
            </div>

            {/* User type */}
            {selectedVertical && (
              <div>
                <span style={label}>I am a…</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {USER_TYPES.map((ut) => (
                    <button
                      key={ut.code}
                      type="button"
                      style={choiceBtn(selectedUserType === ut.code)}
                      onClick={() => setSelectedUserType(ut.code)}
                    >
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{ut.label}</div>
                      <div style={{ fontSize: 11, opacity: 0.6, marginTop: 2 }}>{ut.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-type */}
            {subTypes.length > 0 && (
              <div>
                <span style={label}>My role</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {subTypes.map((st) => (
                    <button
                      key={st.code}
                      type="button"
                      style={choiceBtn(selectedSubType?.code === st.code)}
                      onClick={() => setSelectedSubType(st)}
                    >
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{st.name}</div>
                      <div style={{ fontSize: 10, opacity: 0.5, fontFamily: 'monospace' }}>{st.code}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Resolved code preview */}
            {resolvedCode && (
              <div style={{ background: 'rgba(184,137,74,0.08)', border: '1px solid rgba(184,137,74,0.25)', borderRadius: 8, padding: '10px 14px' }}>
                <div style={{ fontSize: 10, color: 'rgba(184,137,74,0.7)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Registration profile</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-primary, #b8894a)', fontFamily: 'monospace', marginTop: 2 }}>{resolvedCode.code}</div>
              </div>
            )}

            {!resolvedCode && cascadeComplete && (
              <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 14px' }}>
                <div style={{ fontSize: 12, color: '#fca5a5' }}>No registration profile found for this combination.</div>
              </div>
            )}

            <button
              type="button"
              style={primaryBtn(!cascadeComplete)}
              disabled={!cascadeComplete}
              onClick={() => cascadeComplete && loadFields(resolvedCode!.code)}
            >
              Continue →
            </button>

            <div style={{ textAlign: 'center', fontSize: 12, color: 'rgba(148,163,184,0.7)', marginTop: 4 }}>
              Already have an account?{' '}
              <a href={buildBrandUrl('/login')} style={{ color: 'var(--color-primary, #b8894a)', textDecoration: 'none' }}>Sign in</a>
            </div>
          </div>
        )}

        {/* ── STEP: FIELDS ── */}
        {step === 'fields' && (
          <div>
            {fields.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
                No additional details required.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {fields.map((f) => (
                  <div key={f.fieldKey}>
                    <span style={label}>{f.label}{f.required ? ' *' : ''}</span>
                    <FieldInput field={f} value={fieldValues[f.fieldKey]} onChange={(v) => setField(f.fieldKey, v)} />
                    {f.helpText && <p style={{ fontSize: 11, color: 'rgba(148,163,184,0.6)', margin: '4px 0 0' }}>{f.helpText}</p>}
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button type="button" onClick={() => setStep('cascade')} style={{ ...primaryBtn(false), background: 'rgba(255,255,255,0.08)', flex: '0 0 80px' }}>
                ← Back
              </button>
              <button
                type="button"
                style={{ ...primaryBtn(!requiredFieldsMet), flex: 1, margin: 0 }}
                disabled={!requiredFieldsMet}
                onClick={() => setStep('credentials')}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP: CREDENTIALS ── */}
        {step === 'credentials' && (
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#fca5a5' }}>
                {error}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <span style={label}>Email *</span>
                <input type="email" style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required />
              </div>
              <div>
                <span style={label}>Password (min 8 chars) *</span>
                <input type="password" style={inputStyle} value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <div>
                <span style={label}>Confirm Password *</span>
                <input type="password" style={inputStyle} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                {confirmPassword && password !== confirmPassword && (
                  <p style={{ fontSize: 11, color: '#fca5a5', margin: '4px 0 0' }}>Passwords do not match</p>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button type="button" onClick={() => setStep('fields')} style={{ ...primaryBtn(false), background: 'rgba(255,255,255,0.08)', flex: '0 0 80px' }}>
                ← Back
              </button>
              <button
                type="submit"
                disabled={!credentialsValid || isLoading}
                style={{ ...primaryBtn(!credentialsValid || isLoading), flex: 1, margin: 0 }}
              >
                {isLoading ? 'Creating account…' : 'Create Account →'}
              </button>
            </div>
          </form>
        )}

        {/* ── STEP: SUCCESS ── */}
        {step === 'success' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#f1f5f9', margin: '0 0 8px' }}>
              {result?.requiresApproval ? 'Application submitted!' : 'Account created!'}
            </h3>
            <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20, lineHeight: 1.6 }}>
              {result?.message}
            </p>
            <button
              type="button"
              onClick={() => { window.location.href = buildBrandUrl('/login'); }}
              style={{ ...primaryBtn(false), width: 'auto', padding: '10px 28px', margin: 0, display: 'inline-block' }}
            >
              Go to Login →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

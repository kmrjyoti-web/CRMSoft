'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, CheckCircle, ChevronRight, ChevronLeft, AlertCircle } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

// ── Types ─────────────────────────────────────────────────────────────────────

type CombinedCodeRecord = {
  id: string;
  code: string;
  displayName: string;
  userType: string;
  subTypeId: string;
};

type SubTypeRecord = {
  id: string;
  code: string;
  name: string;
  allowedBusinessModes: string[];
  defaultBusinessMode?: string | null;
  businessModeRequired: boolean;
};

type FieldDef = {
  id: string;
  fieldKey: string;
  fieldType: string;
  label: string;
  placeholder?: string | null;
  helpText?: string | null;
  required: boolean;
  options?: string[] | null;
  sortOrder: number;
};

type WizardStep = 'pick_role' | 'business_mode' | 'fields' | 'credentials' | 'success';

interface Props {
  brandCode: string;           // e.g. "travvellis"
  verticalCode?: string;       // e.g. "TRAVEL_TOURISM" — derived from combined code
  initialCombinedCode?: string; // pre-select if ?cc= in URL
  accentColor?: string;
  logoText?: string;
}

// ── Field renderer ────────────────────────────────────────────────────────────

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: any;
  onChange: (v: any) => void;
}) {
  const base = 'w-full text-sm bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#d4b878] transition-colors';

  if (field.fieldType === 'textarea') {
    return (
      <textarea
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder ?? ''}
        rows={3}
        className={base + ' resize-none'}
        required={field.required}
      />
    );
  }

  if (field.fieldType === 'select') {
    const opts = field.options ?? [];
    return (
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className={base}
        required={field.required}
      >
        <option value="">— select —</option>
        {opts.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  }

  if (field.fieldType === 'multiselect') {
    const opts = field.options ?? [];
    const selected: string[] = Array.isArray(value) ? value : [];
    return (
      <div className="flex flex-wrap gap-2">
        {opts.map((o) => {
          const active = selected.includes(o);
          return (
            <button
              key={o}
              type="button"
              onClick={() => onChange(active ? selected.filter((x) => x !== o) : [...selected, o])}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                active
                  ? 'bg-[#d4b878]/20 border-[#d4b878] text-[#d4b878]'
                  : 'bg-transparent border-[#334155] text-slate-400 hover:border-slate-400'
              }`}
            >
              {o}
            </button>
          );
        })}
      </div>
    );
  }

  const htmlType = field.fieldType === 'email' ? 'email'
    : field.fieldType === 'phone' ? 'tel'
    : field.fieldType === 'number' ? 'number'
    : 'text';

  return (
    <input
      type={htmlType}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder ?? ''}
      required={field.required}
      className={base}
    />
  );
}

// ── Main Wizard ───────────────────────────────────────────────────────────────

export default function DynamicRegistrationWizard({
  brandCode,
  initialCombinedCode,
  accentColor = '#d4b878',
  logoText = 'CRMSoft',
}: Props) {
  // Data state
  const [combinedCodes, setCombinedCodes] = useState<CombinedCodeRecord[]>([]);
  const [subTypes, setSubTypes] = useState<SubTypeRecord[]>([]);
  const [fields, setFields] = useState<FieldDef[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Wizard state
  const [step, setStep] = useState<WizardStep>(initialCombinedCode ? 'business_mode' : 'pick_role');
  const [selectedCC, setSelectedCC] = useState<CombinedCodeRecord | null>(null);
  const [selectedSubType, setSelectedSubType] = useState<SubTypeRecord | null>(null);
  const [selectedModes, setSelectedModes] = useState<string[]>([]);
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [successResult, setSuccessResult] = useState<{ requiresApproval: boolean; message?: string } | null>(null);

  // ── Load combined codes for brand ──────────────────────────────────────────
  useEffect(() => {
    setLoadingData(true);
    Promise.all([
      fetch(`${API_BASE}/pc-config/combined-codes?brandCode=${encodeURIComponent(brandCode)}`).then((r) => r.json()),
      fetch(`${API_BASE}/pc-config/sub-types`).then((r) => r.json()),
    ])
      .then(([ccRes, stRes]) => {
        const ccList: CombinedCodeRecord[] = Array.isArray(ccRes) ? ccRes : (ccRes?.data ?? []);
        const stList: SubTypeRecord[] = Array.isArray(stRes) ? stRes : (stRes?.data ?? []);
        setCombinedCodes(ccList);
        setSubTypes(stList);

        if (initialCombinedCode) {
          const cc = ccList.find((c) => c.code === initialCombinedCode);
          if (cc) {
            setSelectedCC(cc);
            const st = stList.find((s) => s.id === cc.subTypeId);
            if (st) {
              setSelectedSubType(st);
              // Auto-select if only one mode
              if (st.allowedBusinessModes.length === 1) {
                setSelectedModes(st.allowedBusinessModes);
              }
              if (st.allowedBusinessModes.length === 0) {
                // Skip business mode step
                setStep('fields');
              }
            }
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoadingData(false));
  }, [brandCode, initialCombinedCode]);

  // ── Load fields when CC changes ─────────────────────────────────────────────
  const loadFields = useCallback(async (ccCode: string) => {
    try {
      const res = await fetch(`${API_BASE}/pc-config/registration-form?combinedCode=${encodeURIComponent(ccCode)}`);
      const data = await res.json();
      setFields(Array.isArray(data) ? data : (data?.data ?? []));
    } catch { setFields([]); }
  }, []);

  // ── Select a combined code ──────────────────────────────────────────────────
  const handleSelectCC = useCallback((cc: CombinedCodeRecord) => {
    setSelectedCC(cc);
    setFieldValues({});
    setSelectedModes([]);
    const st = subTypes.find((s) => s.id === cc.subTypeId);
    setSelectedSubType(st ?? null);

    loadFields(cc.code);

    if (!st || st.allowedBusinessModes.length === 0) {
      setStep('fields');
    } else if (st.allowedBusinessModes.length === 1) {
      setSelectedModes(st.allowedBusinessModes);
      setStep('fields');
    } else {
      setStep('business_mode');
    }
  }, [subTypes, loadFields]);

  // Ensure fields loaded when we reach the fields step
  useEffect(() => {
    if (step === 'fields' && selectedCC && fields.length === 0) {
      loadFields(selectedCC.code);
    }
  }, [step, selectedCC, fields.length, loadFields]);

  // ── Submit registration ─────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!selectedCC || !selectedSubType) return;
    if (password !== confirmPassword) { setSubmitError('Passwords do not match.'); return; }
    if (password.length < 8) { setSubmitError('Password must be at least 8 characters.'); return; }

    setSubmitError('');
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register-dynamic`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          combinedCode: selectedCC.code,
          brandCode,
          verticalCode: 'TRAVEL_TOURISM', // derived from combined code — could be dynamic in future
          userType: selectedCC.userType,
          subTypeCode: selectedSubType.code,
          email,
          password,
          mobile: fieldValues['mobile'],
          fields: {
            ...fieldValues,
            ...(selectedModes.length > 0 ? { businessModes: selectedModes } : {}),
          },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setSubmitError(data.message ?? 'Registration failed');
        return;
      }
      setSuccessResult({
        requiresApproval: data.data?.requiresApproval ?? false,
        message: data.data?.message,
      });
      setStep('success');
    } catch (e: any) {
      setSubmitError(e.message ?? 'Network error');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Step progress bar ───────────────────────────────────────────────────────
  const STEPS_ORDERED: WizardStep[] = ['pick_role', 'business_mode', 'fields', 'credentials'];
  const activeSteps = STEPS_ORDERED.filter((s) => {
    if (s === 'pick_role' && initialCombinedCode) return false;
    if (s === 'business_mode' && (!selectedSubType || selectedSubType.allowedBusinessModes.length <= 1)) return false;
    return true;
  });
  const currentIdx = activeSteps.indexOf(step);

  // ── Styles ──────────────────────────────────────────────────────────────────
  const accent = accentColor;
  const card: React.CSSProperties = {
    background: '#1e293b', border: '1px solid #334155', borderRadius: 12,
    padding: '32px 28px', width: '100%', maxWidth: 480,
  };

  if (loadingData) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#0f172a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <p style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: accent, fontWeight: 600, margin: '0 0 6px' }}>
          {logoText}
        </p>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>Create Your Account</h1>
      </div>

      {/* Progress dots */}
      {step !== 'success' && activeSteps.length > 1 && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
          {activeSteps.map((s, i) => (
            <div key={s} style={{
              width: i <= currentIdx ? 20 : 6, height: 6, borderRadius: 3,
              background: i <= currentIdx ? accent : '#334155',
              transition: 'all 0.3s',
            }} />
          ))}
        </div>
      )}

      <div style={card}>

        {/* ── STEP: PICK ROLE ─────────────────────────────────────────────── */}
        {step === 'pick_role' && (
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#f1f5f9', margin: '0 0 4px' }}>Who are you?</h2>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px' }}>Select the account type that best describes you.</p>

            {combinedCodes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#64748b', fontSize: 13 }}>
                No registration options available for this brand.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {combinedCodes.map((cc) => {
                  const st = subTypes.find((s) => s.id === cc.subTypeId);
                  return (
                    <button
                      key={cc.id}
                      type="button"
                      onClick={() => handleSelectCC(cc)}
                      style={{
                        background: '#0f172a', border: '1px solid #334155', borderRadius: 8,
                        padding: '14px 16px', textAlign: 'left', cursor: 'pointer',
                        transition: 'border-color 0.2s',
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.borderColor = accent)}
                      onMouseOut={(e) => (e.currentTarget.style.borderColor = '#334155')}
                    >
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>{cc.displayName}</p>
                      {st && (
                        <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>
                          {cc.userType === 'B2B' ? 'Business Account' : cc.userType === 'B2C' ? 'Personal Account' : 'Professional Account'}
                          {st.allowedBusinessModes.length > 0 && ` · ${st.allowedBusinessModes.join(' / ')}`}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── STEP: BUSINESS MODE ─────────────────────────────────────────── */}
        {step === 'business_mode' && selectedSubType && (
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#f1f5f9', margin: '0 0 4px' }}>Who do you sell to?</h2>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px' }}>
              Choose your primary business model as a <strong style={{ color: '#94a3b8' }}>{selectedCC?.displayName}</strong>.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {selectedSubType.allowedBusinessModes.map((mode) => {
                const active = selectedModes.includes(mode);
                const label = mode === 'B2B' ? 'B2B — Sell to other businesses' : 'B2C — Sell direct to travelers';
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setSelectedModes((prev) => prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode])}
                    style={{
                      background: active ? `${accent}15` : '#0f172a',
                      border: `1px solid ${active ? accent : '#334155'}`,
                      borderRadius: 8, padding: '14px 16px', textAlign: 'left', cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: active ? accent : '#f1f5f9' }}>{label}</p>
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={() => setStep('pick_role')}
                style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid #334155', borderRadius: 8, color: '#64748b', fontSize: 13, cursor: 'pointer' }}>
                <ChevronLeft className="w-4 h-4 inline mr-1" />Back
              </button>
              <button type="button"
                onClick={() => { if (selectedModes.length > 0) setStep('fields'); }}
                disabled={selectedSubType.businessModeRequired && selectedModes.length === 0}
                style={{ flex: 2, padding: '10px', background: accent, border: 'none', borderRadius: 8, color: '#0f172a', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: selectedSubType.businessModeRequired && selectedModes.length === 0 ? 0.5 : 1 }}>
                Continue <ChevronRight className="w-4 h-4 inline ml-1" />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP: FORM FIELDS ───────────────────────────────────────────── */}
        {step === 'fields' && (
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#f1f5f9', margin: '0 0 4px' }}>Your Details</h2>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px' }}>Tell us about yourself to complete your profile.</p>

            {fields.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: '#64748b', fontSize: 13 }}>
                <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                Loading form…
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
                {fields.map((f) => (
                  <div key={f.fieldKey}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {f.label}{f.required && <span style={{ color: '#f87171', marginLeft: 3 }}>*</span>}
                    </label>
                    <FieldInput
                      field={f}
                      value={fieldValues[f.fieldKey]}
                      onChange={(v) => setFieldValues((prev) => ({ ...prev, [f.fieldKey]: v }))}
                    />
                    {f.helpText && <p style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>{f.helpText}</p>}
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button"
                onClick={() => {
                  if (!selectedSubType || selectedSubType.allowedBusinessModes.length <= 1) setStep('pick_role');
                  else setStep('business_mode');
                }}
                style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid #334155', borderRadius: 8, color: '#64748b', fontSize: 13, cursor: 'pointer' }}>
                <ChevronLeft className="w-4 h-4 inline mr-1" />Back
              </button>
              <button type="button"
                onClick={() => setStep('credentials')}
                disabled={fields.length === 0}
                style={{ flex: 2, padding: '10px', background: accent, border: 'none', borderRadius: 8, color: '#0f172a', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: fields.length === 0 ? 0.5 : 1 }}>
                Continue <ChevronRight className="w-4 h-4 inline ml-1" />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP: CREDENTIALS ───────────────────────────────────────────── */}
        {step === 'credentials' && (
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#f1f5f9', margin: '0 0 4px' }}>Account Setup</h2>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px' }}>Set your login email and password.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
              {[
                { label: 'Email Address', value: email, setter: setEmail, type: 'email', placeholder: 'you@example.com' },
                { label: 'Password', value: password, setter: setPassword, type: 'password', placeholder: '••••••••' },
                { label: 'Confirm Password', value: confirmPassword, setter: setConfirmPassword, type: 'password', placeholder: '••••••••' },
              ].map(({ label, value, setter, type, placeholder }) => (
                <div key={label}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {label} <span style={{ color: '#f87171' }}>*</span>
                  </label>
                  <input
                    type={type}
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    placeholder={placeholder}
                    style={{ width: '100%', padding: '10px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              ))}
            </div>

            {submitError && (
              <div style={{ background: '#450a0a', border: '1px solid #991b1b', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#fca5a5', display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertCircle className="w-4 h-4 flex-shrink-0" />{submitError}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={() => setStep('fields')}
                style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid #334155', borderRadius: 8, color: '#64748b', fontSize: 13, cursor: 'pointer' }}>
                <ChevronLeft className="w-4 h-4 inline mr-1" />Back
              </button>
              <button type="button"
                onClick={handleSubmit}
                disabled={submitting || !email || !password || !confirmPassword}
                style={{ flex: 2, padding: '10px', background: submitting ? '#475569' : accent, border: 'none', borderRadius: 8, color: '#0f172a', fontSize: 13, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />Creating Account…</> : 'Create Account'}
              </button>
            </div>

            {/* Summary */}
            <div style={{ marginTop: 16, padding: '12px 14px', background: '#0f172a', borderRadius: 8, fontSize: 12, color: '#475569', lineHeight: 1.6 }}>
              <strong style={{ color: '#64748b' }}>Summary:</strong>{' '}
              {selectedCC?.displayName}
              {selectedModes.length > 0 && ` · ${selectedModes.join(' + ')}`}
            </div>
          </div>
        )}

        {/* ── STEP: SUCCESS ────────────────────────────────────────────────── */}
        {step === 'success' && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <CheckCircle className="w-12 h-12 mx-auto mb-4" style={{ color: '#4ade80' }} />
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', margin: '0 0 8px' }}>
              {successResult?.requiresApproval ? 'Registration Submitted!' : 'Account Created!'}
            </h2>
            <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 24px' }}>
              {successResult?.requiresApproval
                ? 'Your registration is pending approval. You will receive an email once verified.'
                : 'Your account is ready. You can now log in.'}
            </p>
            <a
              href="/login"
              style={{ display: 'inline-block', padding: '10px 28px', background: accent, borderRadius: 8, color: '#0f172a', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}
            >
              Go to Login
            </a>
          </div>
        )}
      </div>

      {/* Footer */}
      {step !== 'success' && (
        <p style={{ marginTop: 16, fontSize: 12, color: '#334155' }}>
          Already have an account?{' '}
          <a href="/login" style={{ color: accent, textDecoration: 'none' }}>Sign in</a>
        </p>
      )}
    </div>
  );
}

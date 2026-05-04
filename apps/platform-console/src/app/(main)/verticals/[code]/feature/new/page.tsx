'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';
import { WizardStepper } from '@/components/wizard/WizardStepper';
import { WizardNav } from '@/components/wizard/WizardNav';
import { WizardField, WizardInput, WizardTextarea, WizardSelect, WizardToggle } from '@/components/wizard/WizardField';

const STEPS = [
  { label: 'Basics', description: 'Identity & module' },
  { label: 'Configuration', description: 'Flags & pricing' },
];

type Module = { id: string; module_code: string; display_name: string };

type Form = {
  feature_code: string;
  feature_name: string;
  description: string;
  category: string;
  sub_category: string;
  module_code: string;
  is_default_enabled: boolean;
  is_premium: boolean;
  is_beta: boolean;
  is_experimental: boolean;
  addon_price: string;
  sort_order: string;
};

const EMPTY: Form = {
  feature_code: '',
  feature_name: '',
  description: '',
  category: 'core',
  sub_category: '',
  module_code: '',
  is_default_enabled: true,
  is_premium: false,
  is_beta: false,
  is_experimental: false,
  addon_price: '',
  sort_order: '99',
};

type ValidationState = 'idle' | 'checking' | 'available' | 'taken';

export default function NewFeaturePage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>(EMPTY);
  const [modules, setModules] = useState<Module[]>([]);
  const [codeValidation, setCodeValidation] = useState<ValidationState>('idle');
  const [codeError, setCodeError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState(false);
  const [error, setError] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    api.creator.getModules(code)
      .then((res: any) => setModules(Array.isArray(res) ? res : []))
      .catch(() => {});
  }, [code]);

  const set = (field: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  useEffect(() => {
    if (!form.feature_code) { setCodeValidation('idle'); setCodeError(''); return; }
    setCodeValidation('checking');
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await api.creator.validateFeature(code, form.feature_code) as { isValid: boolean; message: string };
        setCodeValidation(res.isValid ? 'available' : 'taken');
        setCodeError(res.isValid ? '' : res.message);
      } catch {
        setCodeValidation('idle');
      }
    }, 500);
  }, [form.feature_code, code]);

  const step0Valid =
    form.feature_code.trim() !== '' &&
    form.feature_name.trim() !== '' &&
    codeValidation === 'available';

  const handleFinish = async () => {
    setSubmitting(true);
    setError('');
    try {
      await api.creator.createFeature(code, {
        feature_code: form.feature_code.trim(),
        feature_name: form.feature_name.trim(),
        description: form.description || undefined,
        category: form.category || 'core',
        sub_category: form.sub_category || undefined,
        module_code: form.module_code || undefined,
        is_default_enabled: form.is_default_enabled,
        is_premium: form.is_premium,
        is_beta: form.is_beta,
        is_experimental: form.is_experimental,
        addon_price: form.addon_price ? parseFloat(form.addon_price) : undefined,
        sort_order: form.sort_order ? parseInt(form.sort_order) : undefined,
      });
      setCreated(true);
    } catch (e: any) {
      setError(e.message ?? 'Failed to create feature');
    } finally {
      setSubmitting(false);
    }
  };

  if (created) {
    return (
      <div className="max-w-lg mx-auto mt-16 text-center space-y-4">
        <CheckCircle2 className="w-12 h-12 text-[#3fb950] mx-auto" />
        <h2 className="text-lg font-semibold text-console-text">Feature Created</h2>
        <p className="text-sm text-console-muted">
          <span className="font-mono text-[#58a6ff]">{form.feature_code}</span> has been added to{' '}
          <span className="font-semibold">{code}</span>.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href={`/verticals/${code}`}
            className="text-xs px-4 py-2 bg-console-accent hover:bg-console-accent/80 text-white rounded-md transition-colors"
          >
            View Vertical
          </Link>
          <button
            onClick={() => { setCreated(false); setForm(EMPTY); setStep(0); setCodeValidation('idle'); }}
            className="text-xs px-4 py-2 bg-console-card border border-console-border text-console-text hover:bg-[#21262d] rounded-md transition-colors"
          >
            Add Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-console-muted">
        <Link href="/verticals" className="hover:text-console-text">Verticals</Link>
        <span>›</span>
        <Link href={`/verticals/${code}`} className="hover:text-console-text">{code}</Link>
        <span>›</span>
        <span className="text-console-text">New Feature</span>
      </div>

      {/* Header */}
      <div className="bg-console-sidebar border border-console-border rounded-lg p-4 flex items-center gap-3">
        <Link href={`/verticals/${code}`} className="text-console-muted hover:text-console-text">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-sm font-semibold text-console-text">New Feature — {code}</h1>
          <p className="text-xs text-console-muted mt-0.5">Add a feature flag to this vertical</p>
        </div>
      </div>

      {/* Card */}
      <div className="bg-console-sidebar border border-console-border rounded-lg p-6 space-y-6">
        <WizardStepper steps={STEPS} current={step} />

        {/* Step 0 — Basics */}
        {step === 0 && (
          <div className="space-y-4">
            <WizardField
              label="Feature Code"
              required
              hint="Snake-case identifier, e.g. bulk_import"
              error={codeError}
            >
              <WizardInput
                value={form.feature_code}
                onChange={set('feature_code')}
                placeholder="bulk_import"
              />
              {codeValidation === 'checking' && (
                <p className="text-[11px] text-console-muted mt-1">Checking…</p>
              )}
              {codeValidation === 'available' && (
                <p className="text-[11px] text-[#3fb950] mt-1">✓ Available</p>
              )}
            </WizardField>

            <WizardField label="Feature Name" required>
              <WizardInput value={form.feature_name} onChange={set('feature_name')} placeholder="Bulk Import" />
            </WizardField>

            <WizardField label="Description">
              <WizardTextarea
                value={form.description}
                onChange={set('description')}
                placeholder="What this feature enables…"
                rows={3}
              />
            </WizardField>

            <div className="grid grid-cols-2 gap-4">
              <WizardField label="Category">
                <WizardSelect value={form.category} onChange={set('category')}>
                  <option value="core">Core</option>
                  <option value="advanced">Advanced</option>
                  <option value="reporting">Reporting</option>
                  <option value="integration">Integration</option>
                  <option value="automation">Automation</option>
                  <option value="ai">AI</option>
                  <option value="security">Security</option>
                  <option value="other">Other</option>
                </WizardSelect>
              </WizardField>

              <WizardField label="Sub-Category" hint="Optional">
                <WizardInput value={form.sub_category} onChange={set('sub_category')} placeholder="e.g. import_export" />
              </WizardField>
            </div>

            <WizardField label="Module" hint="Associate feature with a specific module (optional)">
              <WizardSelect value={form.module_code} onChange={set('module_code')}>
                <option value="">— No module —</option>
                {modules.map((m) => (
                  <option key={m.id} value={m.module_code}>{m.display_name} ({m.module_code})</option>
                ))}
              </WizardSelect>
            </WizardField>

            <WizardField label="Sort Order" hint="Lower = higher in list">
              <WizardInput type="number" value={form.sort_order} onChange={set('sort_order')} placeholder="99" />
            </WizardField>
          </div>
        )}

        {/* Step 1 — Configuration */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-3 bg-console-card border border-console-border rounded-md p-4">
              <WizardToggle
                checked={form.is_default_enabled}
                onChange={(v) => setForm((f) => ({ ...f, is_default_enabled: v }))}
                label="Enabled by Default"
                description="Brands get this feature on when vertical is enabled"
              />
              <WizardToggle
                checked={form.is_premium}
                onChange={(v) => setForm((f) => ({ ...f, is_premium: v }))}
                label="Premium Feature"
                description="Requires paid upgrade"
              />
              <WizardToggle
                checked={form.is_beta}
                onChange={(v) => setForm((f) => ({ ...f, is_beta: v }))}
                label="Beta"
                description="Feature is in beta testing"
              />
              <WizardToggle
                checked={form.is_experimental}
                onChange={(v) => setForm((f) => ({ ...f, is_experimental: v }))}
                label="Experimental"
                description="Opt-in only; may change without notice"
              />
            </div>

            <WizardField label="Add-on Price (INR)" hint="Extra charge for this feature">
              <WizardInput type="number" value={form.addon_price} onChange={set('addon_price')} placeholder="0" />
            </WizardField>

            {error && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-md px-4 py-3 text-xs text-red-400">
                {error}
              </div>
            )}

            <div className="bg-console-card border border-console-border rounded-md p-4 text-xs text-console-muted space-y-1">
              <p className="font-semibold text-console-text mb-2">Review</p>
              <p><span className="text-console-muted/60">Code:</span> <span className="font-mono text-[#58a6ff]">{form.feature_code}</span></p>
              <p><span className="text-console-muted/60">Name:</span> {form.feature_name}</p>
              <p><span className="text-console-muted/60">Category:</span> {form.category}</p>
              {form.module_code && <p><span className="text-console-muted/60">Module:</span> {form.module_code}</p>}
            </div>
          </div>
        )}

        <WizardNav
          step={step}
          totalSteps={STEPS.length}
          onPrev={() => setStep((s) => s - 1)}
          onNext={() => setStep((s) => s + 1)}
          onFinish={handleFinish}
          nextDisabled={step === 0 ? !step0Valid : false}
          finishing={submitting}
          finishLabel="Create Feature"
        />
      </div>
    </div>
  );
}

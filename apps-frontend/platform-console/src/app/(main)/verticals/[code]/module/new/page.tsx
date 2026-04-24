'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';
import { WizardStepper } from '@/components/wizard/WizardStepper';
import { WizardNav } from '@/components/wizard/WizardNav';
import { WizardField, WizardInput, WizardTextarea, WizardToggle } from '@/components/wizard/WizardField';

const STEPS = [
  { label: 'Basics', description: 'Identity & display' },
  { label: 'Technical', description: 'Package & API' },
  { label: 'Configuration', description: 'Pricing & flags' },
];

type Form = {
  module_code: string;
  module_name: string;
  display_name: string;
  description: string;
  icon_name: string;
  color_theme: string;
  sort_order: string;
  is_required: boolean;
  is_default_enabled: boolean;
  is_premium: boolean;
  package_path: string;
  api_namespace: string;
  db_tables: string;
  depends_on: string;
  conflicts_with: string;
  addon_price: string;
  per_user_addon: string;
};

const EMPTY: Form = {
  module_code: '',
  module_name: '',
  display_name: '',
  description: '',
  icon_name: '',
  color_theme: '',
  sort_order: '99',
  is_required: false,
  is_default_enabled: true,
  is_premium: false,
  package_path: '',
  api_namespace: '',
  db_tables: '',
  depends_on: '',
  conflicts_with: '',
  addon_price: '',
  per_user_addon: '',
};

type ValidationState = 'idle' | 'checking' | 'available' | 'taken';

export default function NewModulePage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>(EMPTY);
  const [codeValidation, setCodeValidation] = useState<ValidationState>('idle');
  const [codeError, setCodeError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState(false);
  const [error, setError] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const set = (field: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  useEffect(() => {
    if (!form.module_code) { setCodeValidation('idle'); setCodeError(''); return; }
    setCodeValidation('checking');
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await api.creator.validateModule(code, form.module_code) as { isValid: boolean; message: string };
        setCodeValidation(res.isValid ? 'available' : 'taken');
        setCodeError(res.isValid ? '' : res.message);
      } catch {
        setCodeValidation('idle');
      }
    }, 500);
  }, [form.module_code, code]);

  const step0Valid =
    form.module_code.trim() !== '' &&
    form.module_name.trim() !== '' &&
    form.display_name.trim() !== '' &&
    codeValidation === 'available';

  const handleFinish = async () => {
    setSubmitting(true);
    setError('');
    try {
      await api.creator.createModule(code, {
        module_code: form.module_code.trim(),
        module_name: form.module_name.trim(),
        display_name: form.display_name.trim(),
        description: form.description || undefined,
        icon_name: form.icon_name || undefined,
        color_theme: form.color_theme || undefined,
        sort_order: form.sort_order ? parseInt(form.sort_order) : undefined,
        is_required: form.is_required,
        is_default_enabled: form.is_default_enabled,
        is_premium: form.is_premium,
        package_path: form.package_path || undefined,
        api_namespace: form.api_namespace || undefined,
        db_tables: form.db_tables ? form.db_tables.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
        depends_on: form.depends_on ? form.depends_on.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
        conflicts_with: form.conflicts_with ? form.conflicts_with.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
        addon_price: form.addon_price ? parseFloat(form.addon_price) : undefined,
        per_user_addon: form.per_user_addon ? parseFloat(form.per_user_addon) : undefined,
      });
      setCreated(true);
    } catch (e: any) {
      setError(e.message ?? 'Failed to create module');
    } finally {
      setSubmitting(false);
    }
  };

  if (created) {
    return (
      <div className="max-w-lg mx-auto mt-16 text-center space-y-4">
        <CheckCircle2 className="w-12 h-12 text-[#3fb950] mx-auto" />
        <h2 className="text-lg font-semibold text-console-text">Module Created</h2>
        <p className="text-sm text-console-muted">
          <span className="font-mono text-[#58a6ff]">{form.module_code}</span> has been added to{' '}
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
        <span className="text-console-text">New Module</span>
      </div>

      {/* Header */}
      <div className="bg-console-sidebar border border-console-border rounded-lg p-4 flex items-center gap-3">
        <Link href={`/verticals/${code}`} className="text-console-muted hover:text-console-text">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-sm font-semibold text-console-text">New Module — {code}</h1>
          <p className="text-xs text-console-muted mt-0.5">Add a module to this vertical's registry</p>
        </div>
      </div>

      {/* Card */}
      <div className="bg-console-sidebar border border-console-border rounded-lg p-6 space-y-6">
        <WizardStepper steps={STEPS} current={step} />

        {/* Step 0 — Basics */}
        {step === 0 && (
          <div className="space-y-4">
            <WizardField
              label="Module Code"
              required
              hint="Snake-case identifier, e.g. lead_management"
              error={codeError}
            >
              <WizardInput
                value={form.module_code}
                onChange={set('module_code')}
                placeholder="lead_management"
              />
              {codeValidation === 'checking' && (
                <p className="text-[11px] text-console-muted mt-1">Checking…</p>
              )}
              {codeValidation === 'available' && (
                <p className="text-[11px] text-[#3fb950] mt-1">✓ Available</p>
              )}
            </WizardField>

            <WizardField label="Module Name" required>
              <WizardInput value={form.module_name} onChange={set('module_name')} placeholder="Lead Management" />
            </WizardField>

            <WizardField label="Display Name" required hint="What users see in the UI">
              <WizardInput value={form.display_name} onChange={set('display_name')} placeholder="Lead Management" />
            </WizardField>

            <WizardField label="Description">
              <WizardTextarea
                value={form.description}
                onChange={set('description')}
                placeholder="Brief description of what this module does…"
                rows={3}
              />
            </WizardField>

            <div className="grid grid-cols-2 gap-4">
              <WizardField label="Icon Name" hint="Lucide icon string">
                <WizardInput value={form.icon_name} onChange={set('icon_name')} placeholder="Users" />
              </WizardField>
              <WizardField label="Color Theme" hint="Hex or CSS color">
                <WizardInput value={form.color_theme} onChange={set('color_theme')} placeholder="#58a6ff" />
              </WizardField>
            </div>

            <WizardField label="Sort Order" hint="Lower = higher in list">
              <WizardInput type="number" value={form.sort_order} onChange={set('sort_order')} placeholder="99" />
            </WizardField>
          </div>
        )}

        {/* Step 1 — Technical */}
        {step === 1 && (
          <div className="space-y-4">
            <WizardField label="Package Path" hint="Relative path to the module package">
              <WizardInput value={form.package_path} onChange={set('package_path')} placeholder="modules/lead-management" />
            </WizardField>

            <WizardField label="API Namespace" hint="e.g. lead or crm/lead">
              <WizardInput value={form.api_namespace} onChange={set('api_namespace')} placeholder="lead" />
            </WizardField>

            <WizardField label="DB Tables" hint="Comma-separated table names">
              <WizardInput value={form.db_tables} onChange={set('db_tables')} placeholder="leads, lead_activities" />
            </WizardField>

            <WizardField label="Depends On" hint="Comma-separated module codes this module requires">
              <WizardInput value={form.depends_on} onChange={set('depends_on')} placeholder="contacts, accounts" />
            </WizardField>

            <WizardField label="Conflicts With" hint="Comma-separated module codes that cannot run alongside">
              <WizardInput value={form.conflicts_with} onChange={set('conflicts_with')} placeholder="" />
            </WizardField>
          </div>
        )}

        {/* Step 2 — Configuration */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-3 bg-console-card border border-console-border rounded-md p-4">
              <WizardToggle
                checked={form.is_default_enabled}
                onChange={(v) => setForm((f) => ({ ...f, is_default_enabled: v }))}
                label="Enabled by Default"
                description="Brands get this module on when vertical is enabled"
              />
              <WizardToggle
                checked={form.is_required}
                onChange={(v) => setForm((f) => ({ ...f, is_required: v }))}
                label="Required Module"
                description="Cannot be disabled by brands"
              />
              <WizardToggle
                checked={form.is_premium}
                onChange={(v) => setForm((f) => ({ ...f, is_premium: v }))}
                label="Premium Module"
                description="Requires paid add-on"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <WizardField label="Add-on Price" hint="One-time add-on (INR)">
                <WizardInput type="number" value={form.addon_price} onChange={set('addon_price')} placeholder="0" />
              </WizardField>
              <WizardField label="Per-User Add-on" hint="Per-seat pricing (INR)">
                <WizardInput type="number" value={form.per_user_addon} onChange={set('per_user_addon')} placeholder="0" />
              </WizardField>
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-md px-4 py-3 text-xs text-red-400">
                {error}
              </div>
            )}

            <div className="bg-console-card border border-console-border rounded-md p-4 text-xs text-console-muted space-y-1">
              <p className="font-semibold text-console-text mb-2">Review</p>
              <p><span className="text-console-muted/60">Code:</span> <span className="font-mono text-[#58a6ff]">{form.module_code}</span></p>
              <p><span className="text-console-muted/60">Name:</span> {form.module_name}</p>
              <p><span className="text-console-muted/60">Display:</span> {form.display_name}</p>
              {form.package_path && <p><span className="text-console-muted/60">Package:</span> {form.package_path}</p>}
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
          finishLabel="Create Module"
        />
      </div>
    </div>
  );
}

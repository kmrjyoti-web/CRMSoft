'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';
import { WizardStepper } from '@/components/wizard/WizardStepper';
import { WizardNav } from '@/components/wizard/WizardNav';
import { WizardField, WizardInput, WizardTextarea, WizardToggle } from '@/components/wizard/WizardField';

const STEPS = [
  { label: 'Identity', description: 'Code & display' },
  { label: 'Technical', description: 'Package & API' },
  { label: 'Pricing & Flags', description: 'Plans & toggles' },
  { label: 'Review', description: 'Confirm & create' },
];

type Form = {
  vertical_code: string;
  vertical_name: string;
  display_name: string;
  description: string;
  icon_name: string;
  color_theme: string;
  sort_order: string;
  folder_path: string;
  package_name: string;
  api_prefix: string;
  database_schemas: string;
  base_price: string;
  per_user_price: string;
  currency: string;
  is_active: boolean;
  is_beta: boolean;
  is_coming_soon: boolean;
};

const EMPTY: Form = {
  vertical_code: '',
  vertical_name: '',
  display_name: '',
  description: '',
  icon_name: '',
  color_theme: '',
  sort_order: '99',
  folder_path: '',
  package_name: '',
  api_prefix: '',
  database_schemas: 'working_db',
  base_price: '',
  per_user_price: '',
  currency: 'INR',
  is_active: true,
  is_beta: false,
  is_coming_soon: false,
};

type ValidationState = 'idle' | 'checking' | 'available' | 'taken';

export default function CreateVerticalPage() {
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>(EMPTY);
  const [codeValidation, setCodeValidation] = useState<ValidationState>('idle');
  const [codeError, setCodeError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<string | null>(null);
  const [error, setError] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const set = (field: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  useEffect(() => {
    if (!form.vertical_code) { setCodeValidation('idle'); setCodeError(''); return; }
    setCodeValidation('checking');
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await api.creator.validateVertical(form.vertical_code) as { isValid: boolean; message: string };
        setCodeValidation(res.isValid ? 'available' : 'taken');
        setCodeError(res.isValid ? '' : res.message);
      } catch {
        setCodeValidation('idle');
      }
    }, 500);
  }, [form.vertical_code]);

  const step0Valid =
    form.vertical_code.trim() !== '' &&
    form.vertical_name.trim() !== '' &&
    form.display_name.trim() !== '' &&
    codeValidation === 'available';

  const step1Valid =
    form.folder_path.trim() !== '' &&
    form.package_name.trim() !== '' &&
    form.api_prefix.trim() !== '';

  const handleFinish = async () => {
    setSubmitting(true);
    setError('');
    try {
      const result = await api.creator.createVertical({
        vertical_code: form.vertical_code.trim(),
        vertical_name: form.vertical_name.trim(),
        display_name: form.display_name.trim(),
        description: form.description || undefined,
        icon_name: form.icon_name || undefined,
        color_theme: form.color_theme || undefined,
        sort_order: form.sort_order ? parseInt(form.sort_order) : undefined,
        folder_path: form.folder_path.trim(),
        package_name: form.package_name.trim(),
        api_prefix: form.api_prefix.trim(),
        database_schemas: form.database_schemas
          ? form.database_schemas.split(',').map((s) => s.trim()).filter(Boolean)
          : undefined,
        base_price: form.base_price ? parseFloat(form.base_price) : undefined,
        per_user_price: form.per_user_price ? parseFloat(form.per_user_price) : undefined,
        currency: form.currency || 'INR',
        is_active: form.is_active,
        is_beta: form.is_beta,
        is_coming_soon: form.is_coming_soon,
      }) as { vertical_code: string };
      setCreated(result.vertical_code ?? form.vertical_code);
    } catch (e: any) {
      setError(e.message ?? 'Failed to create vertical');
    } finally {
      setSubmitting(false);
    }
  };

  if (created) {
    return (
      <div className="max-w-lg mx-auto mt-16 text-center space-y-4">
        <CheckCircle2 className="w-12 h-12 text-[#3fb950] mx-auto" />
        <h2 className="text-lg font-semibold text-console-text">Vertical Created</h2>
        <p className="text-sm text-console-muted">
          <span className="font-mono text-[#58a6ff]">{created}</span> is now in the registry.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href={`/verticals/${created}`}
            className="text-xs px-4 py-2 bg-console-accent hover:bg-console-accent/80 text-white rounded-md transition-colors"
          >
            View Vertical
          </Link>
          <button
            onClick={() => { setCreated(null); setForm(EMPTY); setStep(0); setCodeValidation('idle'); }}
            className="text-xs px-4 py-2 bg-console-card border border-console-border text-console-text hover:bg-[#21262d] rounded-md transition-colors"
          >
            Create Another
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
        <span className="text-console-text">Create New</span>
      </div>

      {/* Header */}
      <div className="bg-console-sidebar border border-console-border rounded-lg p-4 flex items-center gap-3">
        <Link href="/verticals" className="text-console-muted hover:text-console-text">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-sm font-semibold text-console-text">Create Vertical (v2)</h1>
          <p className="text-xs text-console-muted mt-0.5">Register a new vertical in the v2 runtime registry</p>
        </div>
      </div>

      {/* Card */}
      <div className="bg-console-sidebar border border-console-border rounded-lg p-6 space-y-6">
        <WizardStepper steps={STEPS} current={step} />

        {/* Step 0 — Identity */}
        {step === 0 && (
          <div className="space-y-4">
            <WizardField
              label="Vertical Code"
              required
              hint="Snake-case unique identifier, e.g. real_estate"
              error={codeError}
            >
              <WizardInput
                value={form.vertical_code}
                onChange={set('vertical_code')}
                placeholder="real_estate"
              />
              {codeValidation === 'checking' && (
                <p className="text-[11px] text-console-muted mt-1">Checking…</p>
              )}
              {codeValidation === 'available' && (
                <p className="text-[11px] text-[#3fb950] mt-1">✓ Available</p>
              )}
            </WizardField>

            <WizardField label="Vertical Name" required>
              <WizardInput value={form.vertical_name} onChange={set('vertical_name')} placeholder="Real Estate" />
            </WizardField>

            <WizardField label="Display Name" required hint="Human-readable name shown in UI">
              <WizardInput value={form.display_name} onChange={set('display_name')} placeholder="Real Estate CRM" />
            </WizardField>

            <WizardField label="Description">
              <WizardTextarea
                value={form.description}
                onChange={set('description')}
                placeholder="Overview of what this vertical covers…"
                rows={3}
              />
            </WizardField>

            <div className="grid grid-cols-3 gap-4">
              <WizardField label="Icon" hint="Lucide icon string">
                <WizardInput value={form.icon_name} onChange={set('icon_name')} placeholder="Home" />
              </WizardField>
              <WizardField label="Color" hint="Hex or CSS color">
                <WizardInput value={form.color_theme} onChange={set('color_theme')} placeholder="#58a6ff" />
              </WizardField>
              <WizardField label="Sort Order">
                <WizardInput type="number" value={form.sort_order} onChange={set('sort_order')} placeholder="99" />
              </WizardField>
            </div>
          </div>
        )}

        {/* Step 1 — Technical */}
        {step === 1 && (
          <div className="space-y-4">
            <WizardField label="Folder Path" required hint="Path relative to monorepo root">
              <WizardInput value={form.folder_path} onChange={set('folder_path')} placeholder="apps/verticals/real-estate" />
            </WizardField>

            <WizardField label="Package Name" required hint="NPM / monorepo package identifier">
              <WizardInput value={form.package_name} onChange={set('package_name')} placeholder="@crm/vertical-real-estate" />
            </WizardField>

            <WizardField label="API Prefix" required hint="URL prefix for all vertical endpoints">
              <WizardInput value={form.api_prefix} onChange={set('api_prefix')} placeholder="/api/real-estate" />
            </WizardField>

            <WizardField label="Database Schemas" hint="Comma-separated schema names">
              <WizardInput value={form.database_schemas} onChange={set('database_schemas')} placeholder="working_db" />
            </WizardField>
          </div>
        )}

        {/* Step 2 — Pricing & Flags */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <WizardField label="Base Price" hint="Per-brand (INR)">
                <WizardInput type="number" value={form.base_price} onChange={set('base_price')} placeholder="0" />
              </WizardField>
              <WizardField label="Per-User Price" hint="Per-seat (INR)">
                <WizardInput type="number" value={form.per_user_price} onChange={set('per_user_price')} placeholder="0" />
              </WizardField>
              <WizardField label="Currency">
                <WizardInput value={form.currency} onChange={set('currency')} placeholder="INR" />
              </WizardField>
            </div>

            <div className="space-y-3 bg-console-card border border-console-border rounded-md p-4">
              <WizardToggle
                checked={form.is_active}
                onChange={(v) => setForm((f) => ({ ...f, is_active: v }))}
                label="Active"
                description="Immediately available to brands"
              />
              <WizardToggle
                checked={form.is_beta}
                onChange={(v) => setForm((f) => ({ ...f, is_beta: v }))}
                label="Beta"
                description="Show beta badge in the UI"
              />
              <WizardToggle
                checked={form.is_coming_soon}
                onChange={(v) => setForm((f) => ({ ...f, is_coming_soon: v }))}
                label="Coming Soon"
                description="Show placeholder; not selectable by brands"
              />
            </div>
          </div>
        )}

        {/* Step 3 — Review */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-console-card border border-console-border rounded-md p-4 text-xs space-y-2">
              <p className="font-semibold text-console-text mb-3">Summary</p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                <span className="text-console-muted">Code</span>
                <span className="font-mono text-[#58a6ff]">{form.vertical_code}</span>
                <span className="text-console-muted">Name</span>
                <span className="text-console-text">{form.vertical_name}</span>
                <span className="text-console-muted">Display</span>
                <span className="text-console-text">{form.display_name}</span>
                <span className="text-console-muted">Folder</span>
                <span className="font-mono text-console-text">{form.folder_path}</span>
                <span className="text-console-muted">Package</span>
                <span className="font-mono text-console-text">{form.package_name}</span>
                <span className="text-console-muted">API Prefix</span>
                <span className="font-mono text-console-text">{form.api_prefix}</span>
                <span className="text-console-muted">Schemas</span>
                <span className="text-console-text">{form.database_schemas}</span>
                <span className="text-console-muted">Base Price</span>
                <span className="text-console-text">{form.base_price || '—'} {form.currency}</span>
                <span className="text-console-muted">Per-User</span>
                <span className="text-console-text">{form.per_user_price || '—'} {form.currency}</span>
                <span className="text-console-muted">Status</span>
                <span className="text-console-text">
                  {form.is_active ? 'Active' : 'Inactive'}
                  {form.is_beta ? ' · Beta' : ''}
                  {form.is_coming_soon ? ' · Coming Soon' : ''}
                </span>
              </div>
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-md px-4 py-3 text-xs text-red-400">
                {error}
              </div>
            )}
          </div>
        )}

        <WizardNav
          step={step}
          totalSteps={STEPS.length}
          onPrev={() => setStep((s) => s - 1)}
          onNext={() => setStep((s) => s + 1)}
          onFinish={handleFinish}
          nextDisabled={
            step === 0 ? !step0Valid :
            step === 1 ? !step1Valid :
            false
          }
          finishing={submitting}
          finishLabel="Create Vertical"
        />
      </div>
    </div>
  );
}

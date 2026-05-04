'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, Palette, Globe, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';

type FormState = {
  brandCode: string;
  brandName: string;
  displayName: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  domain: string;
  subdomain: string;
  contactEmail: string;
  logoUrl: string;
};

const STEPS = [
  { n: 1, label: 'Identity', icon: Palette },
  { n: 2, label: 'Domain', icon: Globe },
  { n: 3, label: 'Review', icon: Sparkles },
] as const;

export default function CreateBrandPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    brandCode: '',
    brandName: '',
    displayName: '',
    description: '',
    primaryColor: '#1976d2',
    secondaryColor: '#dc004e',
    domain: '',
    subdomain: '',
    contactEmail: '',
    logoUrl: '',
  });

  const set = (key: keyof FormState) => (val: string) => setForm((f) => ({ ...f, [key]: val }));

  const step1Valid = form.brandCode.trim() !== '' && form.brandName.trim() !== '' && form.displayName.trim() !== '';

  const handleCreate = async () => {
    setCreating(true);
    setError(null);
    try {
      const payload = {
        brandCode: form.brandCode.trim(),
        brandName: form.brandName.trim(),
        displayName: form.displayName.trim(),
        ...(form.description && { description: form.description }),
        ...(form.primaryColor && { primaryColor: form.primaryColor }),
        ...(form.secondaryColor && { secondaryColor: form.secondaryColor }),
        ...(form.domain && { domain: form.domain.trim() }),
        ...(form.subdomain && { subdomain: form.subdomain.trim() }),
        ...(form.contactEmail && { contactEmail: form.contactEmail.trim() }),
        ...(form.logoUrl && { logoUrl: form.logoUrl.trim() }),
      };
      const data = await api.brandConfig.create(payload) as any;
      const id = data?.id ?? data?.data?.id;
      if (id) {
        router.push(`/brand-config/${id}`);
      } else {
        setError('Brand created but no ID returned. Check the brands list.');
      }
    } catch (e: any) {
      setError(e?.message ?? 'Failed to create brand');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/brand-config" className="text-console-muted hover:text-console-text">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h2 className="text-base font-semibold text-console-text">Create New Brand</h2>
          <p className="text-xs text-console-muted">Set up a brand profile for vertical deployment</p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const done = step > s.n;
          const active = step === s.n;
          return (
            <div key={s.n} className="flex items-center flex-1">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    done
                      ? 'bg-console-accent text-white'
                      : active
                      ? 'bg-[#58a6ff] text-white'
                      : 'bg-console-card text-console-muted border border-console-border'
                  }`}
                >
                  {done ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-xs text-console-muted">Step {s.n}</p>
                  <p className="text-xs font-medium text-console-text">{s.label}</p>
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px mx-4 ${done ? 'bg-console-accent' : 'bg-console-border'}`} />
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-console-sidebar border border-console-border rounded-lg p-6">
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-console-text mb-4">Brand Identity</h3>
            <Field label="Brand Code *" value={form.brandCode} onChange={set('brandCode')} placeholder="e.g., partner-travel-1" mono />
            <Field label="Brand Name *" value={form.brandName} onChange={set('brandName')} placeholder="e.g., Travel Solutions Ltd" />
            <Field label="Display Name *" value={form.displayName} onChange={set('displayName')} placeholder="Shown in UI headers" />
            <div>
              <label className="block text-xs text-console-muted mb-1.5">Description</label>
              <textarea
                className="w-full bg-console-bg border border-console-border rounded px-3 py-2 text-sm text-console-text placeholder-console-muted resize-none focus:outline-none focus:border-[#58a6ff]"
                rows={3}
                value={form.description}
                onChange={(e) => set('description')(e.target.value)}
                placeholder="Brief description of this brand..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-console-muted mb-1.5">Primary Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    className="w-10 h-10 rounded cursor-pointer bg-console-bg border border-console-border"
                    value={form.primaryColor}
                    onChange={(e) => set('primaryColor')(e.target.value)}
                  />
                  <span className="text-xs font-mono text-console-muted">{form.primaryColor}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs text-console-muted mb-1.5">Secondary Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    className="w-10 h-10 rounded cursor-pointer bg-console-bg border border-console-border"
                    value={form.secondaryColor}
                    onChange={(e) => set('secondaryColor')(e.target.value)}
                  />
                  <span className="text-xs font-mono text-console-muted">{form.secondaryColor}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-console-text mb-4">Domain & Contact</h3>
            <Field label="Domain" value={form.domain} onChange={set('domain')} placeholder="e.g., travel.crmsoft.com" />
            <Field label="Subdomain" value={form.subdomain} onChange={set('subdomain')} placeholder="e.g., travel" />
            <Field label="Contact Email" value={form.contactEmail} onChange={set('contactEmail')} placeholder="contact@brand.com" />
            <Field label="Logo URL" value={form.logoUrl} onChange={set('logoUrl')} placeholder="https://cdn.example.com/logo.png" />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-console-text mb-4">Review & Create</h3>
            <div className="bg-console-bg rounded-lg p-4 border border-console-border">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-14 h-14 rounded-lg flex items-center justify-center text-white font-bold text-2xl flex-shrink-0"
                  style={{ backgroundColor: form.primaryColor }}
                >
                  {form.brandName[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <p className="font-semibold text-console-text">{form.brandName || '—'}</p>
                  <p className="text-xs font-mono text-console-muted">{form.brandCode}</p>
                  <p className="text-xs text-console-muted mt-0.5">{form.displayName}</p>
                </div>
              </div>
              <dl className="space-y-2 text-xs">
                <Row label="Domain" value={form.domain} />
                <Row label="Subdomain" value={form.subdomain} />
                <Row label="Contact" value={form.contactEmail} />
              </dl>
              {form.description && (
                <p className="mt-3 pt-3 border-t border-console-border text-xs text-console-muted">{form.description}</p>
              )}
            </div>
            <p className="text-xs text-console-muted">
              After creation you will be taken to the brand detail page to assign verticals and configure overrides.
            </p>
            {error && (
              <p className="text-xs text-red-400 bg-red-900/20 border border-red-800 rounded px-3 py-2">{error}</p>
            )}
          </div>
        )}

        <div className="flex justify-between mt-6 pt-6 border-t border-console-border">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : router.push('/brand-config')}
            className="flex items-center gap-1.5 text-xs text-console-muted hover:text-console-text transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> {step > 1 ? 'Previous' : 'Cancel'}
          </button>

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={step === 1 && !step1Valid}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#58a6ff] hover:bg-[#58a6ff]/80 disabled:bg-console-card disabled:text-console-muted text-white rounded-md transition-colors"
            >
              Next <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleCreate}
              disabled={creating}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-console-accent hover:bg-console-accent/80 disabled:bg-console-card disabled:text-console-muted text-white rounded-md transition-colors"
            >
              {creating ? 'Creating...' : <><Check className="w-3.5 h-3.5" /> Create Brand</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, placeholder, mono,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  mono?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs text-console-muted mb-1.5">{label}</label>
      <input
        type="text"
        className={`w-full bg-console-bg border border-console-border rounded px-3 py-2 text-sm text-console-text placeholder-console-muted focus:outline-none focus:border-[#58a6ff] ${mono ? 'font-mono' : ''}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-console-muted">{label}:</dt>
      <dd className="text-console-text">{value || '—'}</dd>
    </div>
  );
}

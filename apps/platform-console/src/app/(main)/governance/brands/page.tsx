'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Palette, Globe, Plus, X, Loader2, Check } from 'lucide-react';
import { api } from '@/lib/api';

type Brand = {
  id: string;
  code: string;
  shortCode?: string;
  name: string;
  description?: string;
  domain?: string;
  subdomain?: string;
  isActive: boolean;
  partnerId?: string;
};

type Partner = { id: string; code: string; name: string };

const emptyForm = {
  code: '', shortCode: '', name: '', description: '',
  partnerId: '', layoutFolder: '', isPublic: false,
};

export default function GovernanceBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [codeStatus, setCodeStatus] = useState<'idle' | 'checking' | 'ok' | 'taken'>('idle');
  const suggestTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const checkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [brandsData, partnersData] = await Promise.all([
        api.pcConfig.brands() as Promise<Brand[]>,
        api.pcConfig.partners() as Promise<Partner[]>,
      ]);
      setBrands(Array.isArray(brandsData) ? brandsData : []);
      setPartners(Array.isArray(partnersData) ? partnersData : []);
    } catch {
      setBrands([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleNameChange = (name: string) => {
    setForm((f) => ({ ...f, name }));
    if (suggestTimer.current) clearTimeout(suggestTimer.current);
    if (name.trim().length >= 2) {
      suggestTimer.current = setTimeout(async () => {
        try {
          const res = await api.pcConfig.suggestCode(name, 'brand') as { suggested: string };
          setForm((f) => ({ ...f, code: res.suggested }));
          scheduleCodeCheck(res.suggested);
        } catch { /* ignore */ }
      }, 400);
    }
  };

  const scheduleCodeCheck = (code: string) => {
    if (checkTimer.current) clearTimeout(checkTimer.current);
    if (!code.trim()) { setCodeStatus('idle'); return; }
    setCodeStatus('checking');
    checkTimer.current = setTimeout(async () => {
      try {
        const res = await api.pcConfig.checkCode(code.trim().toUpperCase(), 'brand') as { available: boolean };
        setCodeStatus(res.available ? 'ok' : 'taken');
      } catch { setCodeStatus('idle'); }
    }, 350);
  };

  const handleCodeChange = (code: string) => {
    setForm((f) => ({ ...f, code: code.toUpperCase() }));
    scheduleCodeCheck(code);
  };

  const handleSave = async () => {
    setError('');
    if (!form.name.trim() || !form.code.trim()) {
      setError('Name and code are required.');
      return;
    }
    if (codeStatus === 'taken') { setError('Code is already taken.'); return; }
    setSaving(true);
    try {
      await api.pcConfig.createBrand({
        code: form.code.trim(),
        shortCode: form.shortCode.trim().toUpperCase() || undefined,
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        partnerId: form.partnerId || undefined,
        layoutFolder: form.layoutFolder.trim() || undefined,
        isPublic: form.isPublic,
      });
      setShowAdd(false);
      setForm(emptyForm);
      setCodeStatus('idle');
      await load();
    } catch (e: any) {
      setError(e.message ?? 'Failed to create brand');
    } finally {
      setSaving(false);
    }
  };

  const CodeIcon = () => {
    if (codeStatus === 'checking') return <Loader2 className="w-3 h-3 text-console-muted animate-spin" />;
    if (codeStatus === 'ok') return <Check className="w-3 h-3 text-[#3fb950]" />;
    if (codeStatus === 'taken') return <X className="w-3 h-3 text-[#f85149]" />;
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold text-console-text flex items-center gap-2">
            <Palette className="w-4 h-4 text-[#d29922]" />
            Brands
          </h2>
          <p className="text-xs text-console-muted mt-0.5">
            Layer 2 — white-label brand identities linked to partners
          </p>
        </div>
        {!showAdd && (
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 text-xs bg-[#238636] hover:bg-[#2ea043] text-white px-3 py-1.5 rounded-md transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Brand
          </button>
        )}
      </div>

      {showAdd && (
        <div className="bg-console-sidebar border border-[#d29922]/40 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold text-console-text">New Brand</p>
            <button onClick={() => { setShowAdd(false); setForm(emptyForm); setCodeStatus('idle'); setError(''); }}>
              <X className="w-3.5 h-3.5 text-console-muted hover:text-console-text" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-console-muted mb-1">Name *</label>
              <input
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Travelsis"
                className="w-full text-xs bg-[#0d1117] border border-console-border rounded px-2.5 py-1.5 text-console-text focus:outline-none focus:border-[#58a6ff]"
              />
            </div>
            <div>
              <label className="block text-xs text-console-muted mb-1">Code * (auto-suggested)</label>
              <div className="relative">
                <input
                  value={form.code}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  placeholder="TRAVELSIS"
                  className={`w-full text-xs bg-[#0d1117] border rounded px-2.5 py-1.5 pr-7 text-console-text font-mono focus:outline-none ${
                    codeStatus === 'taken' ? 'border-[#f85149]' : codeStatus === 'ok' ? 'border-[#3fb950]' : 'border-console-border focus:border-[#58a6ff]'
                  }`}
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2"><CodeIcon /></span>
              </div>
            </div>
            <div>
              <label className="block text-xs text-console-muted mb-1">Short Code</label>
              <input
                value={form.shortCode}
                onChange={(e) => setForm((f) => ({ ...f, shortCode: e.target.value.toUpperCase() }))}
                placeholder="TLS"
                maxLength={6}
                className="w-full text-xs bg-[#0d1117] border border-console-border rounded px-2.5 py-1.5 text-console-text font-mono focus:outline-none focus:border-[#58a6ff]"
              />
            </div>
            <div>
              <label className="block text-xs text-console-muted mb-1">Partner</label>
              <select
                value={form.partnerId}
                onChange={(e) => setForm((f) => ({ ...f, partnerId: e.target.value }))}
                className="w-full text-xs bg-[#0d1117] border border-console-border rounded px-2.5 py-1.5 text-console-text focus:outline-none focus:border-[#58a6ff]"
              >
                <option value="">— no partner —</option>
                {partners.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-console-muted mb-1">Layout Folder</label>
              <input
                value={form.layoutFolder}
                onChange={(e) => setForm((f) => ({ ...f, layoutFolder: e.target.value }))}
                placeholder="travelsis"
                className="w-full text-xs bg-[#0d1117] border border-console-border rounded px-2.5 py-1.5 text-console-text focus:outline-none focus:border-[#58a6ff]"
              />
            </div>
            <div className="flex items-center gap-2 pt-4">
              <input
                id="isPublic"
                type="checkbox"
                checked={form.isPublic}
                onChange={(e) => setForm((f) => ({ ...f, isPublic: e.target.checked }))}
                className="w-3.5 h-3.5 rounded accent-[#58a6ff]"
              />
              <label htmlFor="isPublic" className="text-xs text-console-muted cursor-pointer">Public brand</label>
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-console-muted mb-1">Description</label>
              <input
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Optional description"
                className="w-full text-xs bg-[#0d1117] border border-console-border rounded px-2.5 py-1.5 text-console-text focus:outline-none focus:border-[#58a6ff]"
              />
            </div>
          </div>

          {error && <p className="text-xs text-[#f85149]">{error}</p>}

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleSave}
              disabled={saving || codeStatus === 'taken' || codeStatus === 'checking'}
              className="flex items-center gap-1.5 text-xs bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded-md transition-colors"
            >
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
              Save Brand
            </button>
            <button
              onClick={() => { setShowAdd(false); setForm(emptyForm); setCodeStatus('idle'); setError(''); }}
              className="text-xs text-console-muted hover:text-console-text px-3 py-1.5"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-console-sidebar border border-console-border rounded-lg animate-pulse" />
          ))}
        </div>
      ) : brands.length === 0 ? (
        <div className="bg-console-sidebar border border-console-border rounded-lg p-12 text-center">
          <Palette className="w-10 h-10 mx-auto mb-3 text-console-muted opacity-30" />
          <p className="text-sm text-console-muted">No brands found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {brands.map((b) => (
            <div key={b.id} className="bg-console-sidebar border border-console-border rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-semibold text-console-text">{b.name}</p>
                  <p className="text-xs font-mono text-console-muted mt-0.5">{b.code}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  {b.shortCode && (
                    <span className="bg-[#30363d] text-console-muted text-xs px-1.5 py-0.5 rounded font-mono">{b.shortCode}</span>
                  )}
                  {b.isActive ? (
                    <span className="bg-[#238636]/20 text-[#3fb950] text-xs px-1.5 py-0.5 rounded">Active</span>
                  ) : (
                    <span className="bg-[#30363d] text-console-muted text-xs px-1.5 py-0.5 rounded">Inactive</span>
                  )}
                </div>
              </div>
              {(b.domain || b.subdomain) && (
                <p className="text-xs text-console-muted flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  {b.domain ?? b.subdomain}
                </p>
              )}
              {b.description && (
                <p className="text-xs text-console-muted mt-1.5 line-clamp-2">{b.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

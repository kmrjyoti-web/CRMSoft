'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Users, Mail, Shield, Plus, X, Loader2, Check } from 'lucide-react';
import { api } from '@/lib/api';

type Partner = {
  id: string;
  code: string;
  shortCode: string;
  name: string;
  description?: string;
  ownerEmail: string;
  licenseLevel?: string;
  licenseExpiry?: string;
  isActive: boolean;
};

const LICENSE_LEVELS = ['STARTER', 'PROFESSIONAL', 'ENTERPRISE', 'CUSTOM'];

const emptyForm = {
  code: '', shortCode: '', name: '', ownerEmail: '',
  description: '', licenseLevel: 'PROFESSIONAL',
};

export default function GovernancePartnersPage() {
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
      const data = await api.pcConfig.partners() as Partner[];
      setPartners(Array.isArray(data) ? data : []);
    } catch {
      setPartners([]);
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
          const res = await api.pcConfig.suggestCode(name, 'partner') as { suggested: string };
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
        const res = await api.pcConfig.checkCode(code.trim().toUpperCase(), 'partner') as { available: boolean };
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
    if (!form.name.trim() || !form.code.trim() || !form.shortCode.trim() || !form.ownerEmail.trim()) {
      setError('Name, code, short code, and owner email are required.');
      return;
    }
    if (codeStatus === 'taken') { setError('Code is already taken.'); return; }
    setSaving(true);
    try {
      await api.pcConfig.createPartner({
        code: form.code.trim(),
        shortCode: form.shortCode.trim().toUpperCase(),
        name: form.name.trim(),
        ownerEmail: form.ownerEmail.trim(),
        description: form.description.trim() || undefined,
        licenseLevel: form.licenseLevel || undefined,
      });
      setShowAdd(false);
      setForm(emptyForm);
      setCodeStatus('idle');
      await load();
    } catch (e: any) {
      setError(e.message ?? 'Failed to create partner');
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
            <Users className="w-4 h-4 text-[#58a6ff]" />
            Partners
          </h2>
          <p className="text-xs text-console-muted mt-0.5">
            Layer 1 of the cascade — top-level license holders
          </p>
        </div>
        {!showAdd && (
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 text-xs bg-[#238636] hover:bg-[#2ea043] text-white px-3 py-1.5 rounded-md transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Partner
          </button>
        )}
      </div>

      {showAdd && (
        <div className="bg-console-sidebar border border-[#58a6ff]/40 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold text-console-text">New Partner</p>
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
                placeholder="Travvellis"
                className="w-full text-xs bg-[#0d1117] border border-console-border rounded px-2.5 py-1.5 text-console-text focus:outline-none focus:border-[#58a6ff]"
              />
            </div>
            <div>
              <label className="block text-xs text-console-muted mb-1">Code * (auto-suggested)</label>
              <div className="relative">
                <input
                  value={form.code}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  placeholder="TRAVVELLIS"
                  className={`w-full text-xs bg-[#0d1117] border rounded px-2.5 py-1.5 pr-7 text-console-text font-mono focus:outline-none ${
                    codeStatus === 'taken' ? 'border-[#f85149]' : codeStatus === 'ok' ? 'border-[#3fb950]' : 'border-console-border focus:border-[#58a6ff]'
                  }`}
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2"><CodeIcon /></span>
              </div>
            </div>
            <div>
              <label className="block text-xs text-console-muted mb-1">Short Code *</label>
              <input
                value={form.shortCode}
                onChange={(e) => setForm((f) => ({ ...f, shortCode: e.target.value.toUpperCase() }))}
                placeholder="TRV"
                maxLength={6}
                className="w-full text-xs bg-[#0d1117] border border-console-border rounded px-2.5 py-1.5 text-console-text font-mono focus:outline-none focus:border-[#58a6ff]"
              />
            </div>
            <div>
              <label className="block text-xs text-console-muted mb-1">Owner Email *</label>
              <input
                type="email"
                value={form.ownerEmail}
                onChange={(e) => setForm((f) => ({ ...f, ownerEmail: e.target.value }))}
                placeholder="owner@company.com"
                className="w-full text-xs bg-[#0d1117] border border-console-border rounded px-2.5 py-1.5 text-console-text focus:outline-none focus:border-[#58a6ff]"
              />
            </div>
            <div>
              <label className="block text-xs text-console-muted mb-1">License Level</label>
              <select
                value={form.licenseLevel}
                onChange={(e) => setForm((f) => ({ ...f, licenseLevel: e.target.value }))}
                className="w-full text-xs bg-[#0d1117] border border-console-border rounded px-2.5 py-1.5 text-console-text focus:outline-none focus:border-[#58a6ff]"
              >
                {LICENSE_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
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
              Save Partner
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
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 bg-console-sidebar border border-console-border rounded-lg animate-pulse" />
          ))}
        </div>
      ) : partners.length === 0 ? (
        <div className="bg-console-sidebar border border-console-border rounded-lg p-12 text-center">
          <Users className="w-10 h-10 mx-auto mb-3 text-console-muted opacity-30" />
          <p className="text-sm text-console-muted">No partners found</p>
        </div>
      ) : (
        <div className="bg-console-sidebar border border-console-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-console-border">
                <th className="text-left px-4 py-2.5 text-xs font-medium text-console-muted">Code</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-console-muted">Name</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-console-muted">Owner Email</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-console-muted">License</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-console-muted">Status</th>
              </tr>
            </thead>
            <tbody>
              {partners.map((p, i) => (
                <tr key={p.id} className={i < partners.length - 1 ? 'border-b border-console-border' : ''}>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs bg-[#30363d] text-[#58a6ff] px-1.5 py-0.5 rounded">{p.code}</span>
                    <span className="ml-1.5 text-xs text-console-muted">/{p.shortCode}</span>
                  </td>
                  <td className="px-4 py-3 text-console-text text-xs font-medium">{p.name}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-xs text-console-muted">
                      <Mail className="w-3 h-3" />{p.ownerEmail}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {p.licenseLevel ? (
                      <span className="flex items-center gap-1 text-xs text-console-muted">
                        <Shield className="w-3 h-3" />{p.licenseLevel}
                      </span>
                    ) : (
                      <span className="text-xs text-console-muted/40">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {p.isActive ? (
                      <span className="bg-[#238636]/20 text-[#3fb950] text-xs px-1.5 py-0.5 rounded">Active</span>
                    ) : (
                      <span className="bg-[#30363d] text-console-muted text-xs px-1.5 py-0.5 rounded">Inactive</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

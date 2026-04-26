'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Factory, Plus, X, Loader2, Check } from 'lucide-react';
import { api } from '@/lib/api';

type CrmEdition = {
  id: string;
  code: string;
  shortCode?: string;
  name: string;
  description?: string;
  isActive: boolean;
  isBuilt: boolean;
};

const emptyForm = { code: '', shortCode: '', name: '', description: '' };

export default function GovernanceCrmEditionsPage() {
  const [editions, setEditions] = useState<CrmEdition[]>([]);
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
      const data = await api.pcConfig.crmEditions() as CrmEdition[];
      setEditions(Array.isArray(data) ? data : []);
    } catch {
      setEditions([]);
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
          const res = await api.pcConfig.suggestCode(name, 'edition') as { suggested: string };
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
        const res = await api.pcConfig.checkCode(code.trim().toUpperCase(), 'edition') as { available: boolean };
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
      await api.pcConfig.createCrmEdition({
        code: form.code.trim(),
        shortCode: form.shortCode.trim().toUpperCase() || undefined,
        name: form.name.trim(),
        description: form.description.trim() || undefined,
      });
      setShowAdd(false);
      setForm(emptyForm);
      setCodeStatus('idle');
      await load();
    } catch (e: any) {
      setError(e.message ?? 'Failed to create CRM edition');
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
            <Factory className="w-4 h-4 text-[#3fb950]" />
            CRM Editions
          </h2>
          <p className="text-xs text-console-muted mt-0.5">
            Layer 3 — product editions (e.g. Travel, Retail, Healthcare)
          </p>
        </div>
        {!showAdd && (
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 text-xs bg-[#238636] hover:bg-[#2ea043] text-white px-3 py-1.5 rounded-md transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Edition
          </button>
        )}
      </div>

      {showAdd && (
        <div className="bg-console-sidebar border border-[#3fb950]/40 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold text-console-text">New CRM Edition</p>
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
                placeholder="Travel CRM"
                className="w-full text-xs bg-[#0d1117] border border-console-border rounded px-2.5 py-1.5 text-console-text focus:outline-none focus:border-[#58a6ff]"
              />
            </div>
            <div>
              <label className="block text-xs text-console-muted mb-1">Code * (auto-suggested)</label>
              <div className="relative">
                <input
                  value={form.code}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  placeholder="TRAVEL"
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
                placeholder="TRV"
                maxLength={6}
                className="w-full text-xs bg-[#0d1117] border border-console-border rounded px-2.5 py-1.5 text-console-text font-mono focus:outline-none focus:border-[#58a6ff]"
              />
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
              Save Edition
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
            <div key={i} className="h-14 bg-console-sidebar border border-console-border rounded-lg animate-pulse" />
          ))}
        </div>
      ) : editions.length === 0 ? (
        <div className="bg-console-sidebar border border-console-border rounded-lg p-12 text-center">
          <Factory className="w-10 h-10 mx-auto mb-3 text-console-muted opacity-30" />
          <p className="text-sm text-console-muted">No CRM editions found</p>
        </div>
      ) : (
        <div className="bg-console-sidebar border border-console-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-console-border">
                <th className="text-left px-4 py-2.5 text-xs font-medium text-console-muted">Code</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-console-muted">Name</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-console-muted">Short</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-console-muted">Built</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-console-muted">Status</th>
              </tr>
            </thead>
            <tbody>
              {editions.map((e, i) => (
                <tr key={e.id} className={i < editions.length - 1 ? 'border-b border-console-border' : ''}>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs bg-[#30363d] text-[#3fb950] px-1.5 py-0.5 rounded">{e.code}</span>
                  </td>
                  <td className="px-4 py-3 text-console-text text-xs font-medium">{e.name}</td>
                  <td className="px-4 py-3 text-xs text-console-muted font-mono">{e.shortCode ?? '—'}</td>
                  <td className="px-4 py-3">
                    {e.isBuilt ? (
                      <span className="bg-[#238636]/20 text-[#3fb950] text-xs px-1.5 py-0.5 rounded">Yes</span>
                    ) : (
                      <span className="bg-[#30363d] text-console-muted text-xs px-1.5 py-0.5 rounded">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {e.isActive ? (
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

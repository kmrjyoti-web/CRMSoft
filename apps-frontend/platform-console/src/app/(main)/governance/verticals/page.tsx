'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Tag, Plus, X, Loader2, Check } from 'lucide-react';
import { api } from '@/lib/api';

type Vertical = {
  id: string;
  typeCode: string;
  typeName: string;
  typeNameHi?: string;
  sortOrder: number;
  isActive: boolean;
  crmEditionId?: string;
};

type CrmEdition = { id: string; code: string; name: string };

const INDUSTRY_CATEGORIES = [
  'SERVICES', 'MANUFACTURING', 'RETAIL', 'HEALTHCARE',
  'EDUCATION', 'TECHNOLOGY', 'FINANCE', 'OTHER',
];

const emptyForm = {
  typeCode: '', typeName: '', industryCategory: 'SERVICES',
  crmEditionId: '', description: '', shortCode: '', sortOrder: '',
};

export default function GovernanceVerticalsPage() {
  const [verticals, setVerticals] = useState<Vertical[]>([]);
  const [editions, setEditions] = useState<CrmEdition[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [codeStatus, setCodeStatus] = useState<'idle' | 'checking' | 'ok' | 'taken'>('idle');
  const suggestTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const checkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadEditions = useCallback(async () => {
    try {
      const data = await api.pcConfig.crmEditions() as CrmEdition[];
      setEditions(Array.isArray(data) ? data : []);
    } catch { /* ignore */ }
  }, []);

  const load = useCallback(async (crmEdition?: string) => {
    setLoading(true);
    try {
      const data = await api.pcConfig.verticals(crmEdition || undefined) as Vertical[];
      setVerticals(Array.isArray(data) ? data : []);
    } catch {
      setVerticals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEditions();
    load();
  }, [load, loadEditions]);

  const handleFilter = (code: string) => {
    setFilter(code);
    load(code || undefined);
  };

  const handleNameChange = (name: string) => {
    setForm((f) => ({ ...f, typeName: name }));
    if (suggestTimer.current) clearTimeout(suggestTimer.current);
    if (name.trim().length >= 2) {
      suggestTimer.current = setTimeout(async () => {
        try {
          const res = await api.pcConfig.suggestCode(name, 'vertical') as { suggested: string };
          setForm((f) => ({ ...f, typeCode: res.suggested }));
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
        const res = await api.pcConfig.checkCode(code.trim().toUpperCase(), 'vertical') as { available: boolean };
        setCodeStatus(res.available ? 'ok' : 'taken');
      } catch { setCodeStatus('idle'); }
    }, 350);
  };

  const handleCodeChange = (code: string) => {
    setForm((f) => ({ ...f, typeCode: code.toUpperCase() }));
    scheduleCodeCheck(code);
  };

  const handleSave = async () => {
    setError('');
    if (!form.typeName.trim() || !form.typeCode.trim()) {
      setError('Name and code are required.');
      return;
    }
    if (codeStatus === 'taken') { setError('Code is already taken.'); return; }
    setSaving(true);
    try {
      await api.pcConfig.createVertical({
        typeCode: form.typeCode.trim(),
        typeName: form.typeName.trim(),
        industryCategory: form.industryCategory,
        crmEditionId: form.crmEditionId || undefined,
        description: form.description.trim() || undefined,
        shortCode: form.shortCode.trim().toUpperCase() || undefined,
        sortOrder: form.sortOrder ? parseInt(form.sortOrder, 10) : undefined,
      });
      setShowAdd(false);
      setForm(emptyForm);
      setCodeStatus('idle');
      await load(filter || undefined);
    } catch (e: any) {
      setError(e.message ?? 'Failed to create vertical');
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-console-text flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#bc8cff]" />
            Verticals
          </h2>
          <p className="text-xs text-console-muted mt-0.5">
            Layer 4 — industry verticals (e.g. TRAVEL_TOURISM, RETAIL)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => handleFilter(e.target.value)}
            className="text-xs bg-console-sidebar border border-console-border rounded-md px-2.5 py-1.5 text-console-text focus:outline-none focus:border-[#58a6ff]"
          >
            <option value="">All editions</option>
            {editions.map((ed) => (
              <option key={ed.code} value={ed.code}>{ed.name}</option>
            ))}
          </select>
          {!showAdd && (
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-1.5 text-xs bg-[#238636] hover:bg-[#2ea043] text-white px-3 py-1.5 rounded-md transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Vertical
            </button>
          )}
        </div>
      </div>

      {showAdd && (
        <div className="bg-console-sidebar border border-[#bc8cff]/40 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold text-console-text">New Vertical</p>
            <button onClick={() => { setShowAdd(false); setForm(emptyForm); setCodeStatus('idle'); setError(''); }}>
              <X className="w-3.5 h-3.5 text-console-muted hover:text-console-text" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-console-muted mb-1">Name *</label>
              <input
                value={form.typeName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Travel & Tourism"
                className="w-full text-xs bg-[#0d1117] border border-console-border rounded px-2.5 py-1.5 text-console-text focus:outline-none focus:border-[#58a6ff]"
              />
            </div>
            <div>
              <label className="block text-xs text-console-muted mb-1">Type Code * (auto-suggested)</label>
              <div className="relative">
                <input
                  value={form.typeCode}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  placeholder="TRAVEL_TOURISM"
                  className={`w-full text-xs bg-[#0d1117] border rounded px-2.5 py-1.5 pr-7 text-console-text font-mono focus:outline-none ${
                    codeStatus === 'taken' ? 'border-[#f85149]' : codeStatus === 'ok' ? 'border-[#3fb950]' : 'border-console-border focus:border-[#58a6ff]'
                  }`}
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2"><CodeIcon /></span>
              </div>
            </div>
            <div>
              <label className="block text-xs text-console-muted mb-1">Industry Category *</label>
              <select
                value={form.industryCategory}
                onChange={(e) => setForm((f) => ({ ...f, industryCategory: e.target.value }))}
                className="w-full text-xs bg-[#0d1117] border border-console-border rounded px-2.5 py-1.5 text-console-text focus:outline-none focus:border-[#58a6ff]"
              >
                {INDUSTRY_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-console-muted mb-1">CRM Edition</label>
              <select
                value={form.crmEditionId}
                onChange={(e) => setForm((f) => ({ ...f, crmEditionId: e.target.value }))}
                className="w-full text-xs bg-[#0d1117] border border-console-border rounded px-2.5 py-1.5 text-console-text focus:outline-none focus:border-[#58a6ff]"
              >
                <option value="">— none —</option>
                {editions.map((ed) => (
                  <option key={ed.id} value={ed.id}>{ed.name} ({ed.code})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-console-muted mb-1">Short Code</label>
              <input
                value={form.shortCode}
                onChange={(e) => setForm((f) => ({ ...f, shortCode: e.target.value.toUpperCase() }))}
                placeholder="TT"
                maxLength={6}
                className="w-full text-xs bg-[#0d1117] border border-console-border rounded px-2.5 py-1.5 text-console-text font-mono focus:outline-none focus:border-[#58a6ff]"
              />
            </div>
            <div>
              <label className="block text-xs text-console-muted mb-1">Sort Order</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
                placeholder="0"
                min={0}
                className="w-full text-xs bg-[#0d1117] border border-console-border rounded px-2.5 py-1.5 text-console-text focus:outline-none focus:border-[#58a6ff]"
              />
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
              Save Vertical
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
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-console-sidebar border border-console-border rounded-lg animate-pulse" />
          ))}
        </div>
      ) : verticals.length === 0 ? (
        <div className="bg-console-sidebar border border-console-border rounded-lg p-12 text-center">
          <Tag className="w-10 h-10 mx-auto mb-3 text-console-muted opacity-30" />
          <p className="text-sm text-console-muted">No verticals found</p>
        </div>
      ) : (
        <div className="bg-console-sidebar border border-console-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-console-border">
                <th className="text-left px-4 py-2.5 text-xs font-medium text-console-muted w-8">#</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-console-muted">Type Code</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-console-muted">Name</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-console-muted">Status</th>
              </tr>
            </thead>
            <tbody>
              {verticals.map((v, i) => (
                <tr key={v.id} className={i < verticals.length - 1 ? 'border-b border-console-border' : ''}>
                  <td className="px-4 py-3 text-xs text-console-muted/60">{v.sortOrder}</td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs bg-[#30363d] text-[#bc8cff] px-1.5 py-0.5 rounded">{v.typeCode}</span>
                  </td>
                  <td className="px-4 py-3 text-console-text text-xs">{v.typeName}</td>
                  <td className="px-4 py-3">
                    {v.isActive ? (
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

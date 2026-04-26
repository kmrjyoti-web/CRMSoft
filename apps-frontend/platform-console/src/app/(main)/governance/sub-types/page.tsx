'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Building2, Plus, X, Check, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

type SubType = {
  id: string;
  code: string;
  shortCode: string;
  name: string;
  description?: string;
  userType: string;
  allowedBusinessModes: string[];
  defaultBusinessMode?: string;
  businessModeRequired: boolean;
  sortOrder: number;
  isActive: boolean;
};

type Vertical = { id: string; typeCode: string; typeName: string };

const USER_TYPES = ['B2B', 'B2C', 'IND_SP', 'IND_EE'];
const BUSINESS_MODES = ['B2B', 'B2C'];

const MODE_BADGE: Record<string, string> = {
  B2B: 'bg-[#58a6ff]/10 text-[#58a6ff]',
  B2C: 'bg-[#f78166]/10 text-[#f78166]',
};

export default function GovernanceSubTypesPage() {
  const [allSubTypes, setAllSubTypes] = useState<SubType[]>([]);
  const [verticals, setVerticals] = useState<Vertical[]>([]);
  const [filterVertical, setFilterVertical] = useState('');
  const [filterUserType, setFilterUserType] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  // Add form state
  const [form, setForm] = useState({
    name: '', code: '', shortCode: '', description: '',
    verticalId: '', userType: 'B2B',
    allowedBusinessModes: [] as string[],
    defaultBusinessMode: '',
    businessModeRequired: true,
  });
  const [codeStatus, setCodeStatus] = useState<'idle' | 'checking' | 'ok' | 'taken'>('idle');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const suggestTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [subs, verts] = await Promise.all([
        api.pcConfig.subTypes() as Promise<SubType[]>,
        api.pcConfig.verticals() as Promise<Vertical[]>,
      ]);
      setAllSubTypes(Array.isArray(subs) ? subs : []);
      setVerticals(Array.isArray(verts) ? verts : []);
    } catch {
      setAllSubTypes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Auto-suggest code when name changes
  useEffect(() => {
    if (!form.name.trim()) { setForm((f) => ({ ...f, code: '' })); setCodeStatus('idle'); return; }
    setCodeStatus('checking');
    if (suggestTimer.current) clearTimeout(suggestTimer.current);
    suggestTimer.current = setTimeout(async () => {
      try {
        const res: any = await api.pcConfig.suggestCode(form.name, 'subtype');
        setForm((f) => ({ ...f, code: res.suggested ?? f.code }));
        setCodeStatus('ok');
      } catch { setCodeStatus('idle'); }
    }, 400);
  }, [form.name]);

  // Re-check when user manually edits code
  const checkCode = useCallback(async (code: string) => {
    if (!code.trim()) { setCodeStatus('idle'); return; }
    setCodeStatus('checking');
    try {
      const res: any = await api.pcConfig.suggestCode(code, 'subtype');
      setCodeStatus(res.suggested === code.toUpperCase() ? 'ok' : 'taken');
    } catch { setCodeStatus('idle'); }
  }, []);

  const toggleMode = (mode: string) => {
    setForm((f) => ({
      ...f,
      allowedBusinessModes: f.allowedBusinessModes.includes(mode)
        ? f.allowedBusinessModes.filter((m) => m !== mode)
        : [...f.allowedBusinessModes, mode],
    }));
  };

  const handleSave = async () => {
    setSaveError('');
    if (!form.name || !form.code || !form.verticalId) { setSaveError('Name, code and vertical are required'); return; }
    setSaving(true);
    try {
      await api.pcConfig.createSubType({
        code: form.code,
        shortCode: form.shortCode || form.code.slice(0, 4),
        name: form.name,
        description: form.description || undefined,
        verticalId: form.verticalId,
        userType: form.userType,
        allowedBusinessModes: form.allowedBusinessModes,
        defaultBusinessMode: form.defaultBusinessMode || undefined,
        businessModeRequired: form.businessModeRequired,
      });
      setShowAdd(false);
      setForm({ name: '', code: '', shortCode: '', description: '', verticalId: '', userType: 'B2B', allowedBusinessModes: [], defaultBusinessMode: '', businessModeRequired: true });
      await load();
    } catch (e: any) {
      setSaveError(e.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  // Apply client-side filters
  const filtered = allSubTypes.filter((s) => {
    if (filterVertical && !s.id) return true; // can't filter by vertical without vertical lookup
    if (filterUserType && s.userType !== filterUserType) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold text-console-text flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#ff7b72]" />
            Sub-Types
          </h2>
          <p className="text-xs text-console-muted mt-0.5">
            Layer 6 — who you are (userType) + who you sell to (businessModes)
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-console-accent text-white rounded-md hover:bg-console-accent/80 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Add Sub-Type
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-console-sidebar border border-console-border rounded-lg p-3 flex items-end gap-3">
        <div className="w-52">
          <label className="block text-xs text-console-muted mb-1">User Type</label>
          <select
            value={filterUserType}
            onChange={(e) => setFilterUserType(e.target.value)}
            className="w-full text-xs bg-[#0d1117] border border-console-border rounded-md px-2.5 py-1.5 text-console-text focus:outline-none"
          >
            <option value="">All user types</option>
            {USER_TYPES.map((ut) => <option key={ut} value={ut}>{ut}</option>)}
          </select>
        </div>
        <span className="text-xs text-console-muted pb-1.5">{filtered.length} sub-type{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="bg-console-sidebar border border-[#58a6ff]/40 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-console-text">Add New Sub-Type</h3>
            <button onClick={() => setShowAdd(false)} className="text-console-muted hover:text-console-text">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-xs text-console-muted mb-1">Name *</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. DMC Provider"
                className="w-full text-xs bg-[#0d1117] border border-console-border rounded-md px-2.5 py-1.5 text-console-text focus:outline-none focus:border-[#58a6ff]"
              />
            </div>

            {/* Code with auto-suggest */}
            <div>
              <label className="block text-xs text-console-muted mb-1">Code *</label>
              <div className="relative">
                <input
                  value={form.code}
                  onChange={(e) => { setForm((f) => ({ ...f, code: e.target.value.toUpperCase() })); checkCode(e.target.value); }}
                  placeholder="Auto-suggested"
                  className="w-full text-xs bg-[#0d1117] border border-console-border rounded-md px-2.5 py-1.5 pr-7 font-mono text-console-text focus:outline-none focus:border-[#58a6ff]"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2">
                  {codeStatus === 'checking' && <Loader2 className="w-3 h-3 text-console-muted animate-spin" />}
                  {codeStatus === 'ok' && <Check className="w-3 h-3 text-[#3fb950]" />}
                  {codeStatus === 'taken' && <X className="w-3 h-3 text-[#f78166]" />}
                </span>
              </div>
              {codeStatus === 'taken' && <p className="text-xs text-[#f78166] mt-0.5">Code already taken</p>}
            </div>

            {/* Short Code */}
            <div>
              <label className="block text-xs text-console-muted mb-1">Short Code</label>
              <input
                value={form.shortCode}
                onChange={(e) => setForm((f) => ({ ...f, shortCode: e.target.value.toUpperCase().slice(0, 10) }))}
                placeholder="4 chars e.g. DMCP"
                className="w-full text-xs bg-[#0d1117] border border-console-border rounded-md px-2.5 py-1.5 font-mono text-console-text focus:outline-none focus:border-[#58a6ff]"
              />
            </div>

            {/* Vertical */}
            <div>
              <label className="block text-xs text-console-muted mb-1">Vertical *</label>
              <select
                value={form.verticalId}
                onChange={(e) => setForm((f) => ({ ...f, verticalId: e.target.value }))}
                className="w-full text-xs bg-[#0d1117] border border-console-border rounded-md px-2.5 py-1.5 text-console-text focus:outline-none focus:border-[#58a6ff]"
              >
                <option value="">Select vertical…</option>
                {verticals.map((v) => <option key={v.id} value={v.id}>{v.typeName} ({v.typeCode})</option>)}
              </select>
            </div>

            {/* User Type */}
            <div>
              <label className="block text-xs text-console-muted mb-1">User Type (who am I?)</label>
              <select
                value={form.userType}
                onChange={(e) => setForm((f) => ({ ...f, userType: e.target.value }))}
                className="w-full text-xs bg-[#0d1117] border border-console-border rounded-md px-2.5 py-1.5 text-console-text focus:outline-none focus:border-[#58a6ff]"
              >
                {USER_TYPES.map((ut) => <option key={ut} value={ut}>{ut}</option>)}
              </select>
            </div>

            {/* Default Mode */}
            <div>
              <label className="block text-xs text-console-muted mb-1">Default Business Mode</label>
              <select
                value={form.defaultBusinessMode}
                onChange={(e) => setForm((f) => ({ ...f, defaultBusinessMode: e.target.value }))}
                className="w-full text-xs bg-[#0d1117] border border-console-border rounded-md px-2.5 py-1.5 text-console-text focus:outline-none focus:border-[#58a6ff]"
              >
                <option value="">— none —</option>
                {form.allowedBusinessModes.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          {/* Allowed Business Modes */}
          <div>
            <label className="block text-xs text-console-muted mb-2">Allowed Business Modes (who I sell to)</label>
            <div className="flex gap-3">
              {BUSINESS_MODES.map((m) => (
                <label key={m} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.allowedBusinessModes.includes(m)}
                    onChange={() => toggleMode(m)}
                    className="rounded"
                  />
                  <span className="text-xs text-console-text">{m}</span>
                </label>
              ))}
              <label className="flex items-center gap-1.5 cursor-pointer ml-4">
                <input
                  type="checkbox"
                  checked={form.businessModeRequired}
                  onChange={(e) => setForm((f) => ({ ...f, businessModeRequired: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-xs text-console-muted">Mode required at registration</span>
              </label>
            </div>
          </div>

          {saveError && <p className="text-xs text-[#f78166]">{saveError}</p>}

          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 text-xs text-console-muted border border-console-border rounded-md hover:bg-white/5">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || codeStatus === 'taken'}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs bg-[#238636] text-white rounded-md hover:bg-[#238636]/80 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
              Save Sub-Type
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 bg-console-sidebar border border-console-border rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-console-sidebar border border-console-border rounded-lg p-8 text-center">
          <p className="text-xs text-console-muted">No sub-types found</p>
        </div>
      ) : (
        <div className="bg-console-sidebar border border-console-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-console-border">
                <th className="text-left px-4 py-2.5 text-xs font-medium text-console-muted">Code</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-console-muted">Name</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-console-muted">Short</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-console-muted">User Type</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-console-muted">Business Modes</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-console-muted">Default</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-console-muted">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={s.id} className={i < filtered.length - 1 ? 'border-b border-console-border' : ''}>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs bg-[#30363d] text-[#ff7b72] px-1.5 py-0.5 rounded">{s.code}</span>
                  </td>
                  <td className="px-4 py-3 text-console-text text-xs">{s.name}</td>
                  <td className="px-4 py-3 text-xs font-mono text-console-muted">{s.shortCode}</td>
                  <td className="px-4 py-3">
                    <span className="bg-[#58a6ff]/10 text-[#58a6ff] text-xs px-1.5 py-0.5 rounded">{s.userType}</span>
                  </td>
                  <td className="px-4 py-3">
                    {(s.allowedBusinessModes as string[]).length === 0 ? (
                      <span className="text-xs text-console-muted">—</span>
                    ) : (
                      <div className="flex gap-1">
                        {(s.allowedBusinessModes as string[]).map((m) => (
                          <span key={m} className={`text-xs px-1.5 py-0.5 rounded ${MODE_BADGE[m] ?? 'bg-console-muted/10 text-console-muted'}`}>{m}</span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {s.defaultBusinessMode ? (
                      <span className="text-xs text-console-muted">{s.defaultBusinessMode}</span>
                    ) : (
                      <span className="text-xs text-console-muted">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {s.isActive ? (
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

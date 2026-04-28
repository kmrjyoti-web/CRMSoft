'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Building2, Plus, X, Check, Loader2, Pencil, Trash2, RotateCcw } from 'lucide-react';
import { api } from '@/lib/api';

type SubType = {
  id: string;
  code: string;
  shortCode: string;
  name: string;
  description?: string;
  verticalId: string;
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

const inputCls = 'w-full text-xs bg-[#0d1117] border border-console-border rounded-md px-2.5 py-1.5 text-console-text focus:outline-none focus:border-[#58a6ff]';
const selectCls = inputCls;

const emptyForm = {
  name: '', code: '', shortCode: '', description: '',
  verticalId: '', userType: 'B2B',
  allowedBusinessModes: [] as string[],
  defaultBusinessMode: '',
  businessModeRequired: true,
};

export default function GovernanceSubTypesPage() {
  const [allSubTypes, setAllSubTypes] = useState<SubType[]>([]);
  const [verticals, setVerticals] = useState<Vertical[]>([]);
  const [filterVerticalId, setFilterVerticalId] = useState('');
  const [filterUserType, setFilterUserType] = useState('');
  const [filterStatus, setFilterStatus] = useState<'active' | 'inactive' | 'all'>('active');
  const [loading, setLoading] = useState(true);

  // Add / Edit panel
  const [panelMode, setPanelMode] = useState<'hidden' | 'add' | 'edit'>('hidden');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [codeStatus, setCodeStatus] = useState<'idle' | 'checking' | 'ok' | 'taken'>('idle');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);

  const suggestTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const checkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [subs, verts] = await Promise.all([
        api.pcConfig.listSubTypesAdmin() as Promise<SubType[]>,
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

  // Auto-suggest code from name (add mode only)
  useEffect(() => {
    if (panelMode !== 'add') return;
    if (!form.name.trim()) { setCodeStatus('idle'); return; }
    if (suggestTimer.current) clearTimeout(suggestTimer.current);
    suggestTimer.current = setTimeout(async () => {
      try {
        const res: any = await api.pcConfig.suggestCode(form.name, 'subtype');
        setForm((f) => ({ ...f, code: res.suggested ?? f.code }));
        scheduleCodeCheck(res.suggested);
      } catch { setCodeStatus('idle'); }
    }, 400);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.name, panelMode]);

  const scheduleCodeCheck = (code: string) => {
    if (checkTimer.current) clearTimeout(checkTimer.current);
    if (!code.trim()) { setCodeStatus('idle'); return; }
    setCodeStatus('checking');
    checkTimer.current = setTimeout(async () => {
      try {
        const res: any = await api.pcConfig.checkCode(code.trim().toUpperCase(), 'subtype');
        setCodeStatus(res.available ? 'ok' : 'taken');
      } catch { setCodeStatus('idle'); }
    }, 350);
  };

  const openAdd = () => {
    setForm(emptyForm);
    setCodeStatus('idle');
    setSaveError('');
    setEditingId(null);
    setPanelMode('add');
  };

  const openEdit = (st: SubType) => {
    setForm({
      name: st.name,
      code: st.code,
      shortCode: st.shortCode,
      description: st.description ?? '',
      verticalId: st.verticalId,
      userType: st.userType,
      allowedBusinessModes: Array.isArray(st.allowedBusinessModes) ? [...st.allowedBusinessModes] : [],
      defaultBusinessMode: st.defaultBusinessMode ?? '',
      businessModeRequired: st.businessModeRequired,
    });
    setCodeStatus('idle');
    setSaveError('');
    setEditingId(st.id);
    setPanelMode('edit');
  };

  const closePanel = () => {
    setPanelMode('hidden');
    setEditingId(null);
    setSaveError('');
  };

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
    if (!form.name.trim()) { setSaveError('Name is required'); return; }
    if (panelMode === 'add' && (!form.code.trim() || !form.verticalId)) {
      setSaveError('Code and vertical are required'); return;
    }
    if (panelMode === 'add' && codeStatus === 'taken') { setSaveError('Code is already taken'); return; }

    setSaving(true);
    try {
      if (panelMode === 'add') {
        await api.pcConfig.createSubType({
          code: form.code.trim().toUpperCase(),
          shortCode: (form.shortCode || form.code.slice(0, 6)).toUpperCase(),
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          verticalId: form.verticalId,
          userType: form.userType,
          allowedBusinessModes: form.allowedBusinessModes,
          defaultBusinessMode: form.defaultBusinessMode || undefined,
          businessModeRequired: form.businessModeRequired,
        });
      } else if (panelMode === 'edit' && editingId) {
        await api.pcConfig.updateSubType(editingId, {
          name: form.name.trim(),
          shortCode: form.shortCode.trim().toUpperCase() || undefined,
          description: form.description.trim() || undefined,
          userType: form.userType,
          allowedBusinessModes: form.allowedBusinessModes,
          defaultBusinessMode: form.defaultBusinessMode || null,
          businessModeRequired: form.businessModeRequired,
        });
      }
      closePanel();
      await load();
    } catch (e: any) {
      setSaveError(e.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (st: SubType) => {
    try {
      await api.pcConfig.updateSubType(st.id, { isActive: !st.isActive });
      await load();
    } catch { /* ignore */ }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setDeleting(true);
    try {
      await api.pcConfig.deleteSubType(deletingId);
      setDeletingId(null);
      setDeleteConfirm('');
      await load();
    } catch { /* ignore */ } finally {
      setDeleting(false);
    }
  };

  const verticalName = (id: string) => verticals.find((v) => v.id === id)?.typeCode ?? '—';

  const filtered = allSubTypes.filter((s) => {
    if (filterVerticalId && s.verticalId !== filterVerticalId) return false;
    if (filterUserType && s.userType !== filterUserType) return false;
    if (filterStatus === 'active' && !s.isActive) return false;
    if (filterStatus === 'inactive' && s.isActive) return false;
    return true;
  });

  const CodeIndicator = () => {
    if (codeStatus === 'checking') return <Loader2 className="w-3 h-3 text-console-muted animate-spin" />;
    if (codeStatus === 'ok') return <Check className="w-3 h-3 text-[#3fb950]" />;
    if (codeStatus === 'taken') return <X className="w-3 h-3 text-[#f78166]" />;
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
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
        {panelMode === 'hidden' && (
          <button onClick={openAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-console-accent text-white rounded-md hover:bg-console-accent/80 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add Sub-Type
          </button>
        )}
      </div>

      {/* Filter bar */}
      <div className="bg-console-sidebar border border-console-border rounded-lg p-3 flex items-end gap-3 flex-wrap">
        <div className="w-52">
          <label className="block text-xs text-console-muted mb-1">Vertical</label>
          <select value={filterVerticalId} onChange={(e) => setFilterVerticalId(e.target.value)} className={selectCls}>
            <option value="">All verticals</option>
            {verticals.map((v) => <option key={v.id} value={v.id}>{v.typeName} ({v.typeCode})</option>)}
          </select>
        </div>
        <div className="w-36">
          <label className="block text-xs text-console-muted mb-1">User Type</label>
          <select value={filterUserType} onChange={(e) => setFilterUserType(e.target.value)} className={selectCls}>
            <option value="">All types</option>
            {USER_TYPES.map((ut) => <option key={ut} value={ut}>{ut}</option>)}
          </select>
        </div>
        <div className="w-28">
          <label className="block text-xs text-console-muted mb-1">Status</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)} className={selectCls}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="all">All</option>
          </select>
        </div>
        {(filterVerticalId || filterUserType || filterStatus !== 'active') && (
          <button onClick={() => { setFilterVerticalId(''); setFilterUserType(''); setFilterStatus('active'); }}
            className="flex items-center gap-1 text-xs text-console-muted hover:text-console-text pb-0.5">
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        )}
        <span className="text-xs text-console-muted pb-1.5 ml-auto">
          {filtered.length} sub-type{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Add / Edit panel */}
      {panelMode !== 'hidden' && (
        <div className="bg-console-sidebar border border-[#58a6ff]/40 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-console-text">
              {panelMode === 'add' ? 'Add New Sub-Type' : `Edit: ${form.code}`}
            </h3>
            <button onClick={closePanel} className="text-console-muted hover:text-console-text">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-xs text-console-muted mb-1">Name *</label>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. DMC Provider" className={inputCls} />
            </div>

            {/* Code (read-only in edit mode) */}
            <div>
              <label className="block text-xs text-console-muted mb-1">
                Code * {panelMode === 'add' ? '(auto-suggested)' : '(locked)'}
              </label>
              {panelMode === 'add' ? (
                <div className="relative">
                  <input value={form.code}
                    onChange={(e) => { setForm((f) => ({ ...f, code: e.target.value.toUpperCase() })); scheduleCodeCheck(e.target.value); }}
                    placeholder="Auto-suggested" className={inputCls + ' pr-7 font-mono'} />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2"><CodeIndicator /></span>
                </div>
              ) : (
                <div className="px-2.5 py-1.5 bg-[#0d1117] border border-console-border/50 rounded-md text-xs font-mono text-console-muted">
                  {form.code}
                </div>
              )}
              {codeStatus === 'taken' && <p className="text-xs text-[#f78166] mt-0.5">Code already taken</p>}
            </div>

            {/* Short Code */}
            <div>
              <label className="block text-xs text-console-muted mb-1">Short Code</label>
              <input value={form.shortCode}
                onChange={(e) => setForm((f) => ({ ...f, shortCode: e.target.value.toUpperCase().slice(0, 10) }))}
                placeholder="e.g. DMCP" className={inputCls + ' font-mono'} />
            </div>

            {/* Vertical (locked in edit mode) */}
            <div>
              <label className="block text-xs text-console-muted mb-1">
                Vertical * {panelMode === 'edit' ? '(locked)' : ''}
              </label>
              {panelMode === 'add' ? (
                <select value={form.verticalId} onChange={(e) => setForm((f) => ({ ...f, verticalId: e.target.value }))} className={selectCls}>
                  <option value="">Select vertical…</option>
                  {verticals.map((v) => <option key={v.id} value={v.id}>{v.typeName} ({v.typeCode})</option>)}
                </select>
              ) : (
                <div className="px-2.5 py-1.5 bg-[#0d1117] border border-console-border/50 rounded-md text-xs font-mono text-console-muted">
                  {verticals.find((v) => v.id === form.verticalId)?.typeName ?? form.verticalId}
                </div>
              )}
            </div>

            {/* User Type */}
            <div>
              <label className="block text-xs text-console-muted mb-1">User Type</label>
              <select value={form.userType} onChange={(e) => setForm((f) => ({ ...f, userType: e.target.value }))} className={selectCls}>
                {USER_TYPES.map((ut) => <option key={ut} value={ut}>{ut}</option>)}
              </select>
            </div>

            {/* Default Mode */}
            <div>
              <label className="block text-xs text-console-muted mb-1">Default Business Mode</label>
              <select value={form.defaultBusinessMode} onChange={(e) => setForm((f) => ({ ...f, defaultBusinessMode: e.target.value }))} className={selectCls}>
                <option value="">— none —</option>
                {form.allowedBusinessModes.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            {/* Description */}
            <div className="col-span-2">
              <label className="block text-xs text-console-muted mb-1">Description</label>
              <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Optional description" className={inputCls} />
            </div>
          </div>

          {/* Business modes */}
          <div>
            <label className="block text-xs text-console-muted mb-2">Allowed Business Modes</label>
            <div className="flex gap-4 flex-wrap">
              {BUSINESS_MODES.map((m) => (
                <label key={m} className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={form.allowedBusinessModes.includes(m)} onChange={() => toggleMode(m)} className="rounded" />
                  <span className="text-xs text-console-text">{m}</span>
                </label>
              ))}
              <label className="flex items-center gap-1.5 cursor-pointer ml-4">
                <input type="checkbox" checked={form.businessModeRequired}
                  onChange={(e) => setForm((f) => ({ ...f, businessModeRequired: e.target.checked }))} className="rounded" />
                <span className="text-xs text-console-muted">Mode required at registration</span>
              </label>
            </div>
          </div>

          {saveError && <p className="text-xs text-[#f78166]">{saveError}</p>}

          <div className="flex gap-2 justify-end">
            <button onClick={closePanel} className="px-3 py-1.5 text-xs text-console-muted border border-console-border rounded-md hover:bg-white/5">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving || (panelMode === 'add' && codeStatus === 'taken')}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs bg-[#238636] text-white rounded-md hover:bg-[#238636]/80 disabled:opacity-40 disabled:cursor-not-allowed">
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
              {panelMode === 'add' ? 'Save Sub-Type' : 'Update Sub-Type'}
            </button>
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      {deletingId && (
        <div className="bg-console-sidebar border border-[#f85149]/40 rounded-lg p-4 space-y-3">
          <p className="text-xs text-[#f85149] font-semibold">Confirm deactivation</p>
          <p className="text-xs text-console-muted">
            This will soft-delete (deactivate) the sub-type. It won't appear in the registration builder.
            Type <span className="font-mono text-console-text">DELETE</span> to confirm.
          </p>
          <div className="flex gap-2 items-center">
            <input value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="Type DELETE" className={inputCls + ' w-36'} />
            <button onClick={handleDelete} disabled={deleteConfirm !== 'DELETE' || deleting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#f85149] text-white rounded-md disabled:opacity-40">
              {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
              Deactivate
            </button>
            <button onClick={() => { setDeletingId(null); setDeleteConfirm(''); }}
              className="px-3 py-1.5 text-xs text-console-muted border border-console-border rounded-md hover:bg-white/5">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 bg-console-sidebar border border-console-border rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-console-sidebar border border-console-border rounded-lg p-8 text-center">
          <Building2 className="w-8 h-8 mx-auto mb-2 text-console-muted/30" />
          <p className="text-xs text-console-muted">No sub-types match the current filters</p>
        </div>
      ) : (
        <div className="bg-console-sidebar border border-console-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-console-border">
                <th className="text-left px-4 py-2.5 text-xs font-medium text-console-muted">Code</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-console-muted">Name</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-console-muted">Short</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-console-muted">Vertical</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-console-muted">User Type</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-console-muted">Modes</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-console-muted">Status</th>
                <th className="text-right px-4 py-2.5 text-xs font-medium text-console-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={s.id} className={`${i < filtered.length - 1 ? 'border-b border-console-border' : ''} ${!s.isActive ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs bg-[#30363d] text-[#ff7b72] px-1.5 py-0.5 rounded">{s.code}</span>
                  </td>
                  <td className="px-4 py-3 text-console-text text-xs">{s.name}</td>
                  <td className="px-4 py-3 text-xs font-mono text-console-muted">{s.shortCode}</td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-console-muted/70">{verticalName(s.verticalId)}</span>
                  </td>
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
                        {s.defaultBusinessMode && (
                          <span className="text-xs text-console-muted/60">({s.defaultBusinessMode})</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleToggleActive(s)}
                      className={`text-xs px-1.5 py-0.5 rounded transition-colors cursor-pointer ${s.isActive ? 'bg-[#238636]/20 text-[#3fb950] hover:bg-[#238636]/30' : 'bg-[#30363d] text-console-muted hover:bg-[#30363d]/70'}`}>
                      {s.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(s)} title="Edit"
                        className="text-console-muted/50 hover:text-[#58a6ff] transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => { setDeletingId(s.id); setDeleteConfirm(''); }} title="Deactivate"
                        className="text-console-muted/50 hover:text-[#f85149] transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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

'use client';

import { useState, useEffect, useCallback } from 'react';
import { ListChecks, GripVertical, Pencil, Trash2, Plus, X, Check, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

interface OnboardingStage {
  id: string;
  stageKey: string;
  stageLabel: string;
  componentName: string;
  sortOrder: number;
  required: boolean;
  isActive: boolean;
  combinedCodeId: string | null;
  skipIfFieldSet: string | null;
}

const EMPTY_FORM = {
  stageKey: '', stageLabel: '', componentName: '',
  required: false, skipIfFieldSet: '',
};

export default function OnboardingStagesPage() {
  const [stages, setStages] = useState<OnboardingStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ stageLabel: '', componentName: '', skipIfFieldSet: '', required: false });
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await api.pcConfig.listOnboardingStagesAdmin();
      setStages(res.data ?? res);
    } catch {
      showToast('Failed to load stages', 'err');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ─── Drag & Drop ──────────────────────────────────────────────────────────

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    setDragOverId(id);
  };

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    setDragOverId(null);
    if (!draggedId || draggedId === targetId) { setDraggedId(null); return; }

    const fromIdx = stages.findIndex(s => s.id === draggedId);
    const toIdx = stages.findIndex(s => s.id === targetId);
    const next = [...stages];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    setStages(next);
    setDraggedId(null);

    try {
      await api.pcConfig.reorderOnboardingStages(next.map(s => s.id));
      showToast('Order saved');
    } catch {
      showToast('Failed to save order', 'err');
      load();
    }
  };

  // ─── Toggle ───────────────────────────────────────────────────────────────

  const handleToggle = async (id: string) => {
    try {
      await api.pcConfig.toggleOnboardingStage(id);
      setStages(prev => prev.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));
    } catch {
      showToast('Failed to toggle stage', 'err');
    }
  };

  // ─── Edit ─────────────────────────────────────────────────────────────────

  const startEdit = (s: OnboardingStage) => {
    setEditId(s.id);
    setEditForm({ stageLabel: s.stageLabel, componentName: s.componentName, skipIfFieldSet: s.skipIfFieldSet ?? '', required: s.required });
  };

  const saveEdit = async () => {
    if (!editId) return;
    setSaving(true);
    try {
      await api.pcConfig.updateOnboardingStage(editId, {
        stageLabel: editForm.stageLabel,
        componentName: editForm.componentName,
        required: editForm.required,
        skipIfFieldSet: editForm.skipIfFieldSet || undefined,
      });
      setStages(prev => prev.map(s => s.id === editId ? { ...s, ...editForm } : s));
      setEditId(null);
      showToast('Stage updated');
    } catch {
      showToast('Failed to update stage', 'err');
    } finally {
      setSaving(false);
    }
  };

  // ─── Add ──────────────────────────────────────────────────────────────────

  const saveAdd = async () => {
    if (!addForm.stageKey || !addForm.stageLabel || !addForm.componentName) {
      showToast('stageKey, label and component are required', 'err');
      return;
    }
    setSaving(true);
    try {
      await api.pcConfig.createOnboardingStage({
        stageKey: addForm.stageKey,
        stageLabel: addForm.stageLabel,
        componentName: addForm.componentName,
        required: addForm.required,
        skipIfFieldSet: addForm.skipIfFieldSet || undefined,
      });
      setShowAdd(false);
      setAddForm(EMPTY_FORM);
      showToast('Stage added');
      load();
    } catch {
      showToast('Failed to create stage', 'err');
    } finally {
      setSaving(false);
    }
  };

  // ─── Delete ───────────────────────────────────────────────────────────────

  const handleDelete = async (id: string) => {
    if (!confirm('Deactivate this stage? Users will no longer see it in onboarding.')) return;
    try {
      await api.pcConfig.deleteOnboardingStage(id);
      showToast('Stage deactivated');
      load();
    } catch {
      showToast('Failed to deactivate stage', 'err');
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div style={{ padding: '28px 32px', maxWidth: 860, margin: '0 auto', fontFamily: 'var(--font-sans, system-ui)' }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          background: toast.type === 'ok' ? '#166534' : '#7f1d1d',
          color: '#fff', padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500,
        }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ListChecks size={22} style={{ color: '#58a6ff' }} />
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: '#e6edf3' }}>Onboarding Stages</h1>
            <p style={{ fontSize: 12, color: '#8b949e', margin: 0 }}>Drag to reorder · toggle to enable/disable · click pencil to edit</p>
          </div>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
            background: '#1f6feb', border: 'none', borderRadius: 6,
            color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer',
          }}
        >
          <Plus size={14} /> Add Stage
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div style={{
          background: '#161b22', border: '1px solid #30363d', borderRadius: 8,
          padding: '20px 24px', marginBottom: 20,
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#e6edf3', marginBottom: 14 }}>New Onboarding Stage</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 11, color: '#8b949e', display: 'block', marginBottom: 4 }}>Stage Key *</label>
              <input
                placeholder="e.g. newsletter_consent"
                value={addForm.stageKey}
                onChange={e => setAddForm(f => ({ ...f, stageKey: e.target.value }))}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, color: '#8b949e', display: 'block', marginBottom: 4 }}>Label *</label>
              <input
                placeholder="e.g. Subscribe to Newsletter"
                value={addForm.stageLabel}
                onChange={e => setAddForm(f => ({ ...f, stageLabel: e.target.value }))}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, color: '#8b949e', display: 'block', marginBottom: 4 }}>Component Name *</label>
              <input
                placeholder="e.g. StageNewsletterConsent"
                value={addForm.componentName}
                onChange={e => setAddForm(f => ({ ...f, componentName: e.target.value }))}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, color: '#8b949e', display: 'block', marginBottom: 4 }}>Skip If Field Set</label>
              <input
                placeholder="e.g. emailVerified"
                value={addForm.skipIfFieldSet}
                onChange={e => setAddForm(f => ({ ...f, skipIfFieldSet: e.target.value }))}
                style={inputStyle}
              />
            </div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#e6edf3', marginBottom: 16, cursor: 'pointer' }}>
            <input type="checkbox" checked={addForm.required} onChange={e => setAddForm(f => ({ ...f, required: e.target.checked }))} />
            Required stage (user cannot skip)
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={saveAdd} disabled={saving} style={{ ...btnStyle, background: '#1f6feb' }}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Save
            </button>
            <button onClick={() => { setShowAdd(false); setAddForm(EMPTY_FORM); }} style={{ ...btnStyle, background: 'transparent', border: '1px solid #30363d', color: '#8b949e' }}>
              <X size={14} /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* Stage list */}
      <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 8, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#8b949e' }}>
            <Loader2 size={20} style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : stages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#8b949e', fontSize: 14 }}>
            No stages configured. Click "Add Stage" to create one.
          </div>
        ) : stages.map((stage, idx) => (
          editId === stage.id ? (
            // Inline edit row
            <div key={stage.id} style={{ padding: '14px 16px', background: '#161b22', borderBottom: '1px solid #21262d' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <div>
                  <label style={{ fontSize: 11, color: '#8b949e', display: 'block', marginBottom: 3 }}>Label</label>
                  <input value={editForm.stageLabel} onChange={e => setEditForm(f => ({ ...f, stageLabel: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: '#8b949e', display: 'block', marginBottom: 3 }}>Component</label>
                  <input value={editForm.componentName} onChange={e => setEditForm(f => ({ ...f, componentName: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: '#8b949e', display: 'block', marginBottom: 3 }}>Skip If Field Set</label>
                  <input value={editForm.skipIfFieldSet} onChange={e => setEditForm(f => ({ ...f, skipIfFieldSet: e.target.value }))} style={inputStyle} placeholder="optional" />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#e6edf3', paddingTop: 18, cursor: 'pointer' }}>
                  <input type="checkbox" checked={editForm.required} onChange={e => setEditForm(f => ({ ...f, required: e.target.checked }))} />
                  Required
                </label>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={saveEdit} disabled={saving} style={{ ...btnStyle, background: '#1f6feb' }}>
                  {saving ? <Loader2 size={13} /> : <Check size={13} />} Save
                </button>
                <button onClick={() => setEditId(null)} style={{ ...btnStyle, background: 'transparent', border: '1px solid #30363d', color: '#8b949e' }}>
                  <X size={13} /> Cancel
                </button>
              </div>
            </div>
          ) : (
            // Normal row
            <div
              key={stage.id}
              draggable
              onDragStart={e => handleDragStart(e, stage.id)}
              onDragOver={e => handleDragOver(e, stage.id)}
              onDrop={e => handleDrop(e, stage.id)}
              onDragLeave={() => setDragOverId(null)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
                borderBottom: '1px solid #21262d',
                background: dragOverId === stage.id ? '#1c2128' : draggedId === stage.id ? 'transparent' : 'transparent',
                opacity: draggedId === stage.id ? 0.4 : stage.isActive ? 1 : 0.5,
                cursor: 'grab',
                transition: 'background 0.1s',
              }}
            >
              <GripVertical size={14} style={{ color: '#484f58', flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: '#484f58', fontFamily: 'monospace', width: 18, textAlign: 'right', flexShrink: 0 }}>{idx + 1}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#e6edf3' }}>{stage.stageLabel}</span>
                  {!stage.required && (
                    <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: '#21262d', color: '#8b949e' }}>optional</span>
                  )}
                  {!stage.isActive && (
                    <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: '#5e2a2a', color: '#f87171' }}>inactive</span>
                  )}
                  {stage.combinedCodeId && (
                    <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: '#1f3a5f', color: '#93c5fd' }}>custom</span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: '#484f58', fontFamily: 'monospace', marginTop: 2 }}>
                  {stage.stageKey} → {stage.componentName}
                  {stage.skipIfFieldSet && <span style={{ color: '#6e7681' }}> · skip if {stage.skipIfFieldSet}</span>}
                </div>
              </div>

              {/* Toggle */}
              <button
                onClick={() => handleToggle(stage.id)}
                title={stage.isActive ? 'Deactivate' : 'Activate'}
                style={{
                  width: 36, height: 20, borderRadius: 10, border: 'none', cursor: 'pointer',
                  background: stage.isActive ? '#1f6feb' : '#21262d',
                  position: 'relative', flexShrink: 0, transition: 'background 0.2s',
                }}
              >
                <span style={{
                  position: 'absolute', top: 2, width: 16, height: 16, borderRadius: '50%', background: '#fff',
                  left: stage.isActive ? 18 : 2, transition: 'left 0.2s',
                }} />
              </button>

              {/* Edit */}
              <button onClick={() => startEdit(stage)} style={iconBtn}>
                <Pencil size={13} style={{ color: '#8b949e' }} />
              </button>

              {/* Delete */}
              <button onClick={() => handleDelete(stage.id)} style={iconBtn}>
                <Trash2 size={13} style={{ color: '#f87171' }} />
              </button>
            </div>
          )
        ))}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: '#0d1117', border: '1px solid #30363d', borderRadius: 6,
  padding: '7px 10px', color: '#e6edf3', fontSize: 13, outline: 'none', boxSizing: 'border-box',
};

const btnStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 5,
  padding: '6px 12px', borderRadius: 6, border: 'none',
  color: '#fff', fontSize: 12, fontWeight: 500, cursor: 'pointer',
};

const iconBtn: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer',
  padding: '4px', borderRadius: 4, display: 'flex', alignItems: 'center',
};

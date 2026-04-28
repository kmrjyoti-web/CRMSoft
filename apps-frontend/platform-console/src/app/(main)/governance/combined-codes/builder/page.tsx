'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Zap, ChevronRight, CheckCircle2, XCircle, Loader2, Save, RotateCcw,
  ListChecks, Layers, Plus, Pencil, Trash2, Eye, EyeOff, GripVertical,
  X, Check,
} from 'lucide-react';
import { api } from '@/lib/api';

type Partner = { id: string; code: string; shortCode: string; name: string };
type Brand = { id: string; code: string; shortCode?: string; name: string };
type CrmEdition = { id: string; code: string; shortCode?: string; name: string };
type Vertical = { id: string; typeCode: string; typeName: string };
type SubType = {
  id: string; code: string; shortCode: string; name: string; userType: string;
  allowedBusinessModes: string[]; defaultBusinessMode?: string; businessModeRequired: boolean;
};
type CombinedCode = { id: string; code: string; displayName: string; description?: string; isActive: boolean };

type AdminField = {
  id: string; fieldKey: string; fieldType: string; label: string;
  placeholder?: string; helpText?: string; required: boolean;
  sortOrder: number; isActive: boolean; visibility: 'visible' | 'hidden';
  options?: unknown; validation?: unknown;
};
type AdminStage = {
  id: string; stageKey: string; stageLabel: string; componentName: string;
  required: boolean; sortOrder: number; isActive: boolean;
  skipIfFieldSet?: string; combinedCodeId?: string;
};

const USER_TYPES = [
  { code: 'B2B', label: 'Business (B2B)' },
  { code: 'B2C', label: 'Business (B2C)' },
  { code: 'IND_SP', label: 'Service Provider' },
  { code: 'IND_EE', label: 'Employee / Job seeker' },
];

const FIELD_TYPES = ['text', 'email', 'phone', 'number', 'select', 'checkbox', 'date', 'textarea', 'file', 'url'];

export default function CombinedCodeBuilderPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [editions, setEditions] = useState<CrmEdition[]>([]);
  const [verticals, setVerticals] = useState<Vertical[]>([]);
  const [subTypes, setSubTypes] = useState<SubType[]>([]);

  const [partner, setPartner] = useState('');
  const [brand, setBrand] = useState('');
  const [edition, setEdition] = useState('');
  const [vertical, setVertical] = useState('');
  const [userType, setUserType] = useState('');
  const [subType, setSubType] = useState('');
  const [selectedModes, setSelectedModes] = useState<string[]>([]);

  const [result, setResult] = useState<CombinedCode | null | 'not-found'>(null);
  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saved, setSaved] = useState(false);

  // ── Tab state ─────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<'fields' | 'stages'>('fields');
  const [tabLoading, setTabLoading] = useState(false);

  // Ref to read selectedStageId inside loadTabData without it being a dep,
  // which would cause loadTabData → lookup → main effect to re-fire every time
  // selectedStageId is set (infinite loop).
  const selectedStageIdRef = useRef<string | null>(null);

  // ── Registration fields admin state ──────────────────────────────────────
  const [adminFields, setAdminFields] = useState<AdminField[]>([]);
  const [fieldDragIdx, setFieldDragIdx] = useState<number | null>(null);
  const [editingField, setEditingField] = useState<AdminField | null>(null);
  const [showAddField, setShowAddField] = useState(false);
  const [newField, setNewField] = useState({ fieldKey: '', fieldType: 'text', label: '', placeholder: '', helpText: '', required: false });
  const [fieldSaving, setFieldSaving] = useState(false);

  // ── Onboarding stages admin state ─────────────────────────────────────────
  const [adminStages, setAdminStages] = useState<AdminStage[]>([]);
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
  const [editingStage, setEditingStage] = useState<Partial<AdminStage>>({});
  const [showAddStage, setShowAddStage] = useState(false);
  const [newStage, setNewStage] = useState({ stageKey: '', stageLabel: '', componentName: '', required: false, skipIfFieldSet: '' });
  const [stageSaving, setStageSaving] = useState(false);

  // ── Stage field state ─────────────────────────────────────────────────────
  const [stageFields, setStageFields] = useState<AdminField[]>([]);
  const [stageFieldsLoading, setStageFieldsLoading] = useState(false);
  const [showAddStageField, setShowAddStageField] = useState(false);
  const [newStageField, setNewStageField] = useState({ fieldKey: '', fieldType: 'text', label: '', required: false });
  const [stageFieldSaving, setStageFieldSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      api.pcConfig.partners() as Promise<Partner[]>,
      api.pcConfig.brands() as Promise<Brand[]>,
      api.pcConfig.crmEditions() as Promise<CrmEdition[]>,
    ]).then(([p, b, e]) => {
      setPartners(Array.isArray(p) ? p : []);
      setBrands(Array.isArray(b) ? b : []);
      setEditions(Array.isArray(e) ? e : []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!edition) { setVerticals([]); setVertical(''); return; }
    api.pcConfig.verticals(edition).then((data) => {
      setVerticals(Array.isArray(data) ? data as Vertical[] : []);
      setVertical(''); setSubType(''); setSubTypes([]);
    }).catch(() => setVerticals([]));
  }, [edition]);

  useEffect(() => {
    if (!vertical || !userType) { setSubTypes([]); setSubType(''); setSelectedModes([]); return; }
    api.pcConfig.subTypes(vertical, userType).then((data) => {
      setSubTypes(Array.isArray(data) ? data as SubType[] : []);
      setSubType('');
    }).catch(() => setSubTypes([]));
  }, [vertical, userType]);

  useEffect(() => {
    if (!subTypeObj) { setSelectedModes([]); return; }
    const modes = subTypeObj.allowedBusinessModes as string[];
    if (modes.length === 1) setSelectedModes(modes);
    else if (modes.length === 0) setSelectedModes([]);
    else setSelectedModes(subTypeObj.defaultBusinessMode ? [subTypeObj.defaultBusinessMode] : []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subType]);

  const partnerObj = partners.find((p) => p.code === partner);
  const brandObj = brands.find((b) => b.code === brand);
  const editionObj = editions.find((e) => e.code === edition);
  const verticalObj = verticals.find((v) => v.typeCode === vertical);
  const subTypeObj = subTypes.find((s) => s.code === subType);

  const modesRequired = subTypeObj?.businessModeRequired && (subTypeObj?.allowedBusinessModes as string[]).length > 1;
  const modesComplete = !modesRequired || selectedModes.length > 0;
  const complete = !!(partner && brand && edition && vertical && userType && subType && subTypeObj && modesComplete);

  const generatedCode = useMemo(() => {
    if (!complete || !editionObj || !brandObj || !subTypeObj) return '';
    return `${userType}_${editionObj.shortCode ?? editionObj.code}_${brandObj.shortCode ?? brandObj.code}_${subTypeObj.shortCode}`;
  }, [complete, userType, editionObj, brandObj, subTypeObj]);

  // Keep the ref current on every render so loadTabData can read it without
  // having selectedStageId as a useCallback dep (which would cause the callback
  // to be recreated on every stage selection, re-triggering lookup, re-triggering
  // the main effect → infinite API loop).
  selectedStageIdRef.current = selectedStageId;

  const loadTabData = useCallback(async (code: string) => {
    setTabLoading(true);
    try {
      const [fields, stages] = await Promise.all([
        (api.pcConfig.listRegistrationFieldsAdmin(code) as Promise<AdminField[]>).catch(() => []),
        (api.pcConfig.listOnboardingStagesAdmin(code) as Promise<AdminStage[]>).catch(() => []),
      ]);
      setAdminFields(Array.isArray(fields) ? fields : []);
      const sorted = Array.isArray(stages) ? stages.sort((a, b) => a.sortOrder - b.sortOrder) : [];
      setAdminStages(sorted);
      if (sorted.length > 0 && !selectedStageIdRef.current) setSelectedStageId(sorted[0].id);
    } finally {
      setTabLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // stable — selectedStageId read via ref above

  const lookup = useCallback(async (code: string) => {
    if (!code) return;
    setChecking(true);
    setResult(null);
    setAdminFields([]); setAdminStages([]);
    setSaved(false); setSaveError('');
    setSelectedStageId(null);
    try {
      const existing = await api.pcConfig.combinedCode(code) as CombinedCode | null;
      setResult(existing ?? 'not-found');
      if (existing) await loadTabData(code);
      else {
        // Load global onboarding stages even for not-found codes
        const stages = await (api.pcConfig.listOnboardingStagesAdmin(undefined) as Promise<AdminStage[]>).catch(() => []);
        const sorted = Array.isArray(stages) ? stages.sort((a, b) => a.sortOrder - b.sortOrder) : [];
        setAdminStages(sorted);
        if (sorted.length > 0) setSelectedStageId(sorted[0].id);
        setTabLoading(false);
      }
    } catch {
      setResult('not-found');
    } finally {
      setChecking(false);
    }
  }, [loadTabData]);

  useEffect(() => {
    if (complete && generatedCode) lookup(generatedCode);
    else { setResult(null); setAdminFields([]); setAdminStages([]); }
  }, [complete, generatedCode, lookup]);

  // Keep a stable ref to adminStages so the effect below can read the current
  // stage without adminStages appearing in its deps. Including adminStages would
  // fire the effect (and re-fetch stage fields) every time loadTabData refreshes
  // the list — even when the selected stage hasn't changed.
  const adminStagesRef = useRef<AdminStage[]>([]);
  adminStagesRef.current = adminStages;

  // Sync editing state + load stage fields when selected stage changes.
  // adminStages is intentionally NOT in deps: we only want to re-fetch stage
  // fields when the user picks a different stage, not on every stages-list refresh.
  useEffect(() => {
    if (!selectedStageId) return;
    const s = adminStagesRef.current.find((x) => x.id === selectedStageId);
    if (s) setEditingStage({ stageLabel: s.stageLabel, componentName: s.componentName, required: s.required, skipIfFieldSet: s.skipIfFieldSet ?? '' });
    setStageFields([]); setShowAddStageField(false);
    setStageFieldsLoading(true);
    (api.pcConfig.listStageFields(selectedStageId) as Promise<{ data?: AdminField[] } | AdminField[]>)
      .then((res) => setStageFields(Array.isArray(res) ? res : (res as any).data ?? []))
      .catch(() => {})
      .finally(() => setStageFieldsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStageId]); // adminStages read via ref — intentionally omitted

  const handleSave = async () => {
    if (!partnerObj || !brandObj || !editionObj || !verticalObj || !subTypeObj || !generatedCode) return;
    setSaving(true); setSaveError('');
    try {
      await api.pcConfig.createCombinedCode({
        code: generatedCode, partnerId: partnerObj.id, brandId: brandObj.id,
        crmEditionId: editionObj.id, verticalId: verticalObj.id, userType,
        subTypeId: subTypeObj.id, displayName: `${brandObj.name} ${subTypeObj.name}`,
        description: `${brandObj.name} ${subTypeObj.name} (${userType})`,
        businessModes: selectedModes,
      });
      setSaved(true);
      await lookup(generatedCode);
    } catch (err: any) { setSaveError(err.message ?? 'Save failed'); }
    finally { setSaving(false); }
  };

  const resetAll = () => {
    setPartner(''); setBrand(''); setEdition(''); setVertical(''); setUserType(''); setSubType(''); setSelectedModes([]);
    setResult(null); setAdminFields([]); setAdminStages([]); setSaved(false); setSaveError('');
  };

  const assembledSegments = [
    { label: 'User Type', value: userType || undefined, color: '#ff7b72' },
    { label: 'CRM Edition', value: editionObj?.shortCode, color: '#3fb950' },
    { label: 'Brand', value: brandObj?.shortCode, color: '#d29922' },
    { label: 'Sub-Type', value: subTypeObj?.shortCode, color: '#79c0ff' },
  ];

  // ── Field handlers ────────────────────────────────────────────────────────

  const handleFieldDrop = async (toIdx: number) => {
    if (fieldDragIdx === null || fieldDragIdx === toIdx) return;
    const reordered = [...adminFields];
    const [item] = reordered.splice(fieldDragIdx, 1);
    reordered.splice(toIdx, 0, item);
    setAdminFields(reordered);
    setFieldDragIdx(null);
    await (api.pcConfig.reorderRegistrationFields(reordered.map((f) => f.id)) as Promise<unknown>).catch(() => {});
  };

  const handleToggleField = async (id: string) => {
    await (api.pcConfig.toggleFieldVisibility(id) as Promise<unknown>).catch(() => {});
    setAdminFields((prev) => prev.map((f) => f.id === id ? { ...f, visibility: f.visibility === 'hidden' ? 'visible' : 'hidden' } : f));
  };

  const handleToggleRequired = async (field: AdminField) => {
    const updated = { ...field, required: !field.required };
    setAdminFields((prev) => prev.map((f) => f.id === field.id ? updated : f));
    await (api.pcConfig.toggleFieldRequired(field.id) as Promise<unknown>).catch(() => {});
  };

  const handleSaveFieldEdit = async () => {
    if (!editingField) return;
    setFieldSaving(true);
    try {
      await api.pcConfig.updateRegistrationField(editingField.id, {
        label: editingField.label, fieldType: editingField.fieldType,
        placeholder: editingField.placeholder, helpText: editingField.helpText,
        required: editingField.required,
      });
      setAdminFields((prev) => prev.map((f) => f.id === editingField.id ? editingField : f));
      setEditingField(null);
    } finally { setFieldSaving(false); }
  };

  const handleDeleteField = async (id: string) => {
    if (!confirm('Soft-delete this field?')) return;
    await (api.pcConfig.deleteRegistrationField(id) as Promise<unknown>).catch(() => {});
    setAdminFields((prev) => prev.map((f) => f.id === id ? { ...f, isActive: false } : f));
  };

  const handleAddField = async () => {
    if (!generatedCode || !newField.fieldKey || !newField.label) return;
    setFieldSaving(true);
    try {
      const created = await api.pcConfig.createRegistrationField({
        combinedCode: generatedCode, ...newField,
      }) as AdminField;
      setAdminFields((prev) => [...prev, created]);
      setNewField({ fieldKey: '', fieldType: 'text', label: '', placeholder: '', helpText: '', required: false });
      setShowAddField(false);
    } finally { setFieldSaving(false); }
  };

  // ── Stage handlers ────────────────────────────────────────────────────────

  const handleSaveStageEdit = async () => {
    if (!selectedStageId) return;
    setStageSaving(true);
    try {
      await api.pcConfig.updateOnboardingStage(selectedStageId, {
        stageLabel: editingStage.stageLabel, componentName: editingStage.componentName,
        required: editingStage.required, skipIfFieldSet: editingStage.skipIfFieldSet || undefined,
      });
      setAdminStages((prev) => prev.map((s) => s.id === selectedStageId ? { ...s, ...editingStage } as AdminStage : s));
    } finally { setStageSaving(false); }
  };

  const handleToggleStage = async (id: string) => {
    await (api.pcConfig.toggleOnboardingStage(id) as Promise<unknown>).catch(() => {});
    setAdminStages((prev) => prev.map((s) => s.id === id ? { ...s, isActive: !s.isActive } : s));
  };

  const handleAddStage = async () => {
    if (!newStage.stageKey || !newStage.stageLabel || !newStage.componentName) return;
    setStageSaving(true);
    const combinedCodeId = result !== 'not-found' && result ? (result as CombinedCode).id : undefined;
    try {
      const created = await api.pcConfig.createOnboardingStage({
        ...newStage, combinedCodeId,
        skipIfFieldSet: newStage.skipIfFieldSet || undefined,
      }) as AdminStage;
      setAdminStages((prev) => [...prev, created].sort((a, b) => a.sortOrder - b.sortOrder));
      setNewStage({ stageKey: '', stageLabel: '', componentName: '', required: false, skipIfFieldSet: '' });
      setShowAddStage(false);
      setSelectedStageId(created.id);
    } finally { setStageSaving(false); }
  };

  const handleAddStageField = async () => {
    if (!selectedStageId || !newStageField.fieldKey || !newStageField.label) return;
    const ccId = result !== 'not-found' && result ? (result as CombinedCode).id : undefined;
    if (!ccId) return;
    setStageFieldSaving(true);
    try {
      const created = await api.pcConfig.addFieldToStage({
        stageId: selectedStageId, combinedCodeId: ccId,
        fieldKey: newStageField.fieldKey, fieldType: newStageField.fieldType,
        label: newStageField.label, required: newStageField.required,
      }) as AdminField;
      setStageFields((prev) => [...prev, created]);
      setNewStageField({ fieldKey: '', fieldType: 'text', label: '', required: false });
      setShowAddStageField(false);
    } finally { setStageFieldSaving(false); }
  };

  const handleDeleteStageField = async (id: string) => {
    if (!confirm('Remove this field from the stage?')) return;
    await (api.pcConfig.deleteRegistrationField(id) as Promise<unknown>).catch(() => {});
    setStageFields((prev) => prev.filter((f) => f.id !== id));
  };

  const selectedStage = adminStages.find((s) => s.id === selectedStageId);

  const selectCls = 'w-full text-xs bg-[#0d1117] border border-console-border rounded-md px-2.5 py-2 text-console-text focus:outline-none focus:border-[#58a6ff]';
  const inputCls = 'w-full text-xs bg-[#0d1117] border border-console-border rounded-md px-2.5 py-2 text-console-text focus:outline-none focus:border-[#58a6ff]';

  const codeExists = result !== null && result !== 'not-found';

  return (
    <div className="flex gap-6 items-start">
      {/* ── LEFT: Cascade selectors ───────────────────────────────────────── */}
      <div className="flex-1 min-w-0 space-y-3 max-w-sm">
        <div>
          <h2 className="text-base font-semibold text-console-text flex items-center gap-2">
            <Zap className="w-4 h-4 text-console-accent" />
            Combined Code Builder
          </h2>
          <p className="text-xs text-console-muted mt-0.5">Select all 6 layers to resolve or create a combined code</p>
        </div>

        {/* 1 — Partner */}
        <Step n={1} color="#58a6ff" label="Partner">
          <select value={partner} onChange={(e) => { setPartner(e.target.value); setResult(null); }} className={selectCls}>
            <option value="">Select partner…</option>
            {partners.map((p) => <option key={p.code} value={p.code}>{p.name} ({p.shortCode})</option>)}
          </select>
        </Step>

        {/* 2 — Brand */}
        <Step n={2} color="#d29922" label="Brand">
          <select value={brand} onChange={(e) => { setBrand(e.target.value); setResult(null); }} className={selectCls}>
            <option value="">Select brand…</option>
            {brands.map((b) => <option key={b.code} value={b.code}>{b.name} ({b.shortCode ?? b.code})</option>)}
          </select>
        </Step>

        {/* 3 — CRM Edition */}
        <Step n={3} color="#3fb950" label="CRM Edition">
          <select value={edition} onChange={(e) => { setEdition(e.target.value); setResult(null); }} className={selectCls}>
            <option value="">Select edition…</option>
            {editions.map((e) => <option key={e.code} value={e.code}>{e.name} ({e.shortCode ?? e.code})</option>)}
          </select>
        </Step>

        {/* 4 — Vertical */}
        <Step n={4} color="#bc8cff" label="Vertical" disabled={!edition} hint="select edition first">
          <select value={vertical} disabled={!edition} onChange={(e) => { setVertical(e.target.value); setResult(null); }} className={selectCls + ' disabled:cursor-not-allowed disabled:opacity-50'}>
            <option value="">Select vertical…</option>
            {verticals.map((v) => <option key={v.typeCode} value={v.typeCode}>{v.typeName}</option>)}
          </select>
        </Step>

        {/* 5 — User Type */}
        <Step n={5} color="#ff7b72" label="User Type" disabled={!vertical} hint="select vertical first">
          <div className="grid grid-cols-2 gap-2">
            {USER_TYPES.map((ut) => (
              <button key={ut.code} disabled={!vertical} onClick={() => { setUserType(ut.code); setSubType(''); setResult(null); }}
                className={`px-3 py-2 text-xs rounded-md border transition-colors text-left disabled:cursor-not-allowed disabled:opacity-50 ${userType === ut.code ? 'border-[#ff7b72] bg-[#ff7b72]/10 text-[#ff7b72]' : 'border-console-border text-console-muted hover:border-[#ff7b72]/50 hover:text-console-text'}`}>
                {ut.label}
              </button>
            ))}
          </div>
        </Step>

        {/* 6 — Sub-Type */}
        <Step n={6} color="#79c0ff" label="Sub-Type" disabled={!userType} hint="select user type first">
          {subTypes.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {subTypes.map((s) => (
                <button key={s.code} onClick={() => setSubType(s.code)}
                  className={`px-3 py-2 text-xs rounded-md border transition-colors text-left ${subType === s.code ? 'border-[#79c0ff] bg-[#79c0ff]/10 text-[#79c0ff]' : 'border-console-border text-console-muted hover:border-[#79c0ff]/50 hover:text-console-text'}`}>
                  <span className="font-mono">{s.shortCode}</span>
                  <span className="ml-1.5 text-console-muted">{s.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-console-muted/60 py-1">{userType ? 'No sub-types available for this combination' : 'Select user type first'}</p>
          )}
        </Step>

        {/* 7 — Business Mode (conditional) */}
        {subTypeObj && (subTypeObj.allowedBusinessModes as string[]).length > 1 && (
          <Step n={7} color="#e3b341" label="Business Mode" hint="who do you sell to?">
            <div className="space-y-2">
              <p className="text-xs text-console-muted/70">Select all that apply</p>
              <div className="flex gap-2">
                {(subTypeObj.allowedBusinessModes as string[]).map((m) => (
                  <button key={m}
                    onClick={() => setSelectedModes((prev) => prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m])}
                    className={`px-3 py-2 text-xs rounded-md border transition-colors ${selectedModes.includes(m) ? 'border-[#e3b341] bg-[#e3b341]/10 text-[#e3b341]' : 'border-console-border text-console-muted hover:border-[#e3b341]/50 hover:text-console-text'}`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </Step>
        )}

        <button onClick={resetAll} className="flex items-center gap-1.5 text-xs text-console-muted hover:text-console-text transition-colors">
          <RotateCcw className="w-3 h-3" /> Reset all
        </button>
      </div>

      {/* ── RIGHT: Code banner + tabs ─────────────────────────────────────── */}
      <div className="flex-1 space-y-4">
        {/* Generated code banner */}
        <div className="bg-console-sidebar border border-console-border rounded-lg p-4">
          <p className="text-xs font-semibold text-console-text mb-3">Generated Code</p>
          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            {assembledSegments.map((seg, i) => (
              <span key={seg.label} className="flex items-center gap-1.5">
                <span className="px-2 py-1 rounded text-xs font-mono" style={{ backgroundColor: seg.value ? seg.color + '22' : '#30363d', color: seg.value ? seg.color : '#6e7681', border: `1px solid ${seg.value ? seg.color + '44' : 'transparent'}` }}>
                  {seg.value ?? `[${seg.label}]`}
                </span>
                {i < assembledSegments.length - 1 && <ChevronRight className="w-3 h-3 text-console-muted/40" />}
              </span>
            ))}
          </div>
          {generatedCode && (
            <div className="bg-[#0d1117] rounded-md px-3 py-2 flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-console-accent">{generatedCode}</span>
              {checking && <Loader2 className="w-3.5 h-3.5 animate-spin text-console-muted ml-auto" />}
            </div>
          )}
        </div>

        {/* Lookup result */}
        {result !== null && (
          <div className={`border rounded-lg p-4 ${result === 'not-found' ? 'bg-[#30363d]/30 border-console-border' : 'bg-[#238636]/10 border-[#238636]/30'}`}>
            {result === 'not-found' ? (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <XCircle className="w-4 h-4 text-console-muted" />
                  <span className="text-xs text-console-muted">No combined code record found — you can create it</span>
                </div>
                {saveError && <p className="text-xs text-[#f85149] mb-2">{saveError}</p>}
                {saved ? (
                  <div className="flex items-center gap-2 text-xs text-[#3fb950]"><CheckCircle2 className="w-3.5 h-3.5" /> Saved successfully!</div>
                ) : (
                  <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 text-xs bg-console-accent text-white rounded-md hover:bg-console-accent/80 transition-colors disabled:opacity-60">
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    {saving ? 'Saving…' : `Create ${generatedCode}`}
                  </button>
                )}
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-[#3fb950]" />
                  <span className="text-xs font-semibold text-[#3fb950]">Combined code exists</span>
                  <span className={`ml-auto text-xs px-1.5 py-0.5 rounded ${result.isActive ? 'bg-[#238636]/20 text-[#3fb950]' : 'bg-[#30363d] text-console-muted'}`}>
                    {result.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="font-mono text-sm text-console-text">{result.code}</p>
                <p className="text-xs text-console-muted mt-1">{result.displayName}</p>
              </div>
            )}
          </div>
        )}

        {/* ── CUSTOMIZATION TABS ─────────────────────────────────────────── */}
        {complete && result !== null && (
          <div className="bg-console-sidebar border border-console-border rounded-lg overflow-hidden">
            {/* Tab bar */}
            <div className="flex border-b border-console-border">
              <button onClick={() => setActiveTab('fields')}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-px ${activeTab === 'fields' ? 'border-[#bc8cff] text-[#bc8cff]' : 'border-transparent text-console-muted hover:text-console-text'}`}>
                <ListChecks className="w-3.5 h-3.5" />
                Registration Fields
                {adminFields.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-[#bc8cff]/20 text-[#bc8cff]">{adminFields.filter((f) => f.visibility !== 'hidden').length}</span>
                )}
              </button>
              <button onClick={() => setActiveTab('stages')}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-px ${activeTab === 'stages' ? 'border-[#58a6ff] text-[#58a6ff]' : 'border-transparent text-console-muted hover:text-console-text'}`}>
                <Layers className="w-3.5 h-3.5" />
                Onboarding Stages
                {adminStages.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-[#58a6ff]/20 text-[#58a6ff]">{adminStages.filter((s) => s.isActive).length}</span>
                )}
              </button>
              {tabLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-console-muted ml-auto mr-3 self-center" />}
            </div>

            {/* ── TAB 1: Registration Fields ────────────────────────────── */}
            {activeTab === 'fields' && (
              <div className="p-4">
                {!codeExists && (
                  <p className="text-xs text-console-muted/60 py-2">Create the combined code first to manage registration fields.</p>
                )}

                {codeExists && (
                  <>
                    {/* Fields list */}
                    <div className="space-y-1 mb-3">
                      {adminFields.length === 0 && !tabLoading && (
                        <p className="text-xs text-console-muted/60 py-2">No fields yet. Add the first one below.</p>
                      )}
                      {adminFields.map((f, idx) => (
                        <div
                          key={f.id}
                          draggable
                          onDragStart={() => setFieldDragIdx(idx)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={() => handleFieldDrop(idx)}
                          className={`flex items-center gap-2 px-2 py-1.5 rounded-md border transition-colors group ${f.visibility !== 'hidden' ? 'border-console-border/60 hover:border-console-border' : 'border-console-border/30 opacity-50'}`}
                        >
                          <GripVertical className="w-3 h-3 text-console-muted/30 cursor-grab shrink-0" />
                          <span className="font-mono text-[10px] text-console-accent w-28 shrink-0 truncate">{f.fieldKey}</span>
                          <span className="text-xs text-console-text flex-1 truncate">{f.label}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#30363d] text-console-muted font-mono shrink-0">{f.fieldType}</span>
                          {/* Required toggle */}
                          <button onClick={() => handleToggleRequired(f)} title={f.required ? 'Required' : 'Optional'}
                            className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors shrink-0 ${f.required ? 'border-[#f85149]/50 text-[#f85149] bg-[#f85149]/10' : 'border-console-border/50 text-console-muted/50 hover:border-console-border'}`}>
                            {f.required ? 'req' : 'opt'}
                          </button>
                          {/* Visibility toggle */}
                          <button onClick={() => handleToggleField(f.id)} title={f.visibility !== 'hidden' ? 'Hide field' : 'Show field'}
                            className="text-console-muted/40 hover:text-console-muted transition-colors shrink-0">
                            {f.visibility !== 'hidden' ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </button>
                          {/* Edit */}
                          <button onClick={() => setEditingField({ ...f })}
                            className="text-console-muted/40 hover:text-[#58a6ff] transition-colors shrink-0">
                            <Pencil className="w-3 h-3" />
                          </button>
                          {/* Delete */}
                          <button onClick={() => handleDeleteField(f.id)}
                            className="text-console-muted/30 hover:text-[#f85149] transition-colors shrink-0">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add field button */}
                    {!showAddField && (
                      <button onClick={() => setShowAddField(true)}
                        className="flex items-center gap-1.5 text-xs text-console-muted hover:text-console-text transition-colors mt-1">
                        <Plus className="w-3.5 h-3.5" /> Add field
                      </button>
                    )}

                    {/* Add field form */}
                    {showAddField && (
                      <div className="border border-console-border/60 rounded-md p-3 mt-2 space-y-2 bg-[#0d1117]/50">
                        <p className="text-xs font-medium text-console-text mb-2">New Registration Field</p>
                        <div className="grid grid-cols-2 gap-2">
                          <input className={inputCls} placeholder="fieldKey (e.g. phone)" value={newField.fieldKey}
                            onChange={(e) => setNewField((p) => ({ ...p, fieldKey: e.target.value }))} />
                          <select className={selectCls} value={newField.fieldType}
                            onChange={(e) => setNewField((p) => ({ ...p, fieldType: e.target.value }))}>
                            {FIELD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                        <input className={inputCls} placeholder="Label (e.g. Phone Number)" value={newField.label}
                          onChange={(e) => setNewField((p) => ({ ...p, label: e.target.value }))} />
                        <input className={inputCls} placeholder="Placeholder (optional)" value={newField.placeholder}
                          onChange={(e) => setNewField((p) => ({ ...p, placeholder: e.target.value }))} />
                        <input className={inputCls} placeholder="Help text (optional)" value={newField.helpText}
                          onChange={(e) => setNewField((p) => ({ ...p, helpText: e.target.value }))} />
                        <label className="flex items-center gap-2 text-xs text-console-muted cursor-pointer">
                          <input type="checkbox" checked={newField.required}
                            onChange={(e) => setNewField((p) => ({ ...p, required: e.target.checked }))}
                            className="rounded" />
                          Required field
                        </label>
                        <div className="flex gap-2 pt-1">
                          <button onClick={handleAddField} disabled={fieldSaving || !newField.fieldKey || !newField.label}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-console-accent text-white rounded-md hover:bg-console-accent/80 disabled:opacity-60">
                            {fieldSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Save
                          </button>
                          <button onClick={() => setShowAddField(false)} className="px-3 py-1.5 text-xs text-console-muted hover:text-console-text border border-console-border/50 rounded-md">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ── TAB 2: Onboarding Stages ──────────────────────────────── */}
            {activeTab === 'stages' && (
              <div className="flex min-h-[280px]">
                {/* Left rail */}
                <div className="w-48 shrink-0 border-r border-console-border overflow-y-auto">
                  {adminStages.map((s, i) => (
                    <button key={s.id} onClick={() => setSelectedStageId(s.id)}
                      className={`w-full text-left px-3 py-2.5 border-b border-console-border/40 transition-colors flex items-start gap-2 ${selectedStageId === s.id ? 'bg-[#58a6ff]/10 border-r-2 border-r-[#58a6ff]' : 'hover:bg-white/5'}`}>
                      <span className="text-[10px] text-console-muted/50 font-mono mt-0.5 shrink-0 w-4">{i + 1}</span>
                      <div className="min-w-0">
                        <p className={`text-xs truncate ${s.isActive ? 'text-console-text' : 'text-console-muted/50 line-through'}`}>{s.stageLabel}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          {s.required ? (
                            <span className="text-[9px] text-[#f85149]">required</span>
                          ) : (
                            <span className="text-[9px] text-console-muted/40">optional</span>
                          )}
                          {!s.isActive && <span className="text-[9px] text-console-muted/40">hidden</span>}
                        </div>
                      </div>
                    </button>
                  ))}

                  {/* Add stage */}
                  {!showAddStage ? (
                    <button onClick={() => setShowAddStage(true)}
                      className="w-full px-3 py-2 text-xs text-console-muted/60 hover:text-console-muted flex items-center gap-1.5 transition-colors">
                      <Plus className="w-3 h-3" /> Add stage
                    </button>
                  ) : (
                    <div className="p-3 space-y-2 border-t border-console-border/40">
                      <p className="text-[10px] font-medium text-console-muted mb-1">New Stage</p>
                      <input className={inputCls} placeholder="stageKey" value={newStage.stageKey}
                        onChange={(e) => setNewStage((p) => ({ ...p, stageKey: e.target.value }))} />
                      <input className={inputCls} placeholder="Label" value={newStage.stageLabel}
                        onChange={(e) => setNewStage((p) => ({ ...p, stageLabel: e.target.value }))} />
                      <input className={inputCls} placeholder="ComponentName" value={newStage.componentName}
                        onChange={(e) => setNewStage((p) => ({ ...p, componentName: e.target.value }))} />
                      <label className="flex items-center gap-2 text-xs text-console-muted cursor-pointer">
                        <input type="checkbox" checked={newStage.required}
                          onChange={(e) => setNewStage((p) => ({ ...p, required: e.target.checked }))} />
                        Required
                      </label>
                      <div className="flex gap-1 pt-1">
                        <button onClick={handleAddStage} disabled={stageSaving || !newStage.stageKey || !newStage.stageLabel}
                          className="flex items-center gap-1 px-2 py-1 text-[10px] bg-console-accent text-white rounded disabled:opacity-60">
                          {stageSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                        </button>
                        <button onClick={() => setShowAddStage(false)} className="px-2 py-1 text-[10px] border border-console-border/50 rounded text-console-muted">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right editor */}
                <div className="flex-1 p-4">
                  {!selectedStage ? (
                    <p className="text-xs text-console-muted/60">Select a stage from the left to edit it.</p>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-semibold text-console-text">{selectedStage.stageLabel}</p>
                        <button onClick={() => handleToggleStage(selectedStage.id)}
                          className={`text-[10px] px-2 py-1 rounded border transition-colors ${selectedStage.isActive ? 'border-[#3fb950]/50 text-[#3fb950] bg-[#3fb950]/10 hover:bg-[#3fb950]/5' : 'border-console-border/50 text-console-muted hover:border-console-border'}`}>
                          {selectedStage.isActive ? 'Active' : 'Hidden'}
                        </button>
                      </div>

                      <div>
                        <label className="text-[10px] text-console-muted uppercase tracking-wide block mb-1">Stage Label</label>
                        <input className={inputCls} value={editingStage.stageLabel ?? ''} onChange={(e) => setEditingStage((p) => ({ ...p, stageLabel: e.target.value }))} />
                      </div>
                      <div>
                        <label className="text-[10px] text-console-muted uppercase tracking-wide block mb-1">Component Name</label>
                        <input className={inputCls} value={editingStage.componentName ?? ''} onChange={(e) => setEditingStage((p) => ({ ...p, componentName: e.target.value }))} />
                        <p className="text-[10px] text-console-muted/50 mt-1 font-mono">{editingStage.componentName}</p>
                      </div>
                      <div>
                        <label className="text-[10px] text-console-muted uppercase tracking-wide block mb-1">Skip if field set</label>
                        <input className={inputCls} placeholder="fieldKey (leave blank to never skip)" value={editingStage.skipIfFieldSet ?? ''} onChange={(e) => setEditingStage((p) => ({ ...p, skipIfFieldSet: e.target.value }))} />
                      </div>
                      <label className="flex items-center gap-2 text-xs text-console-muted cursor-pointer">
                        <input type="checkbox" checked={editingStage.required ?? false}
                          onChange={(e) => setEditingStage((p) => ({ ...p, required: e.target.checked }))} />
                        Required stage
                      </label>
                      <button onClick={handleSaveStageEdit} disabled={stageSaving}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-console-accent text-white rounded-md hover:bg-console-accent/80 disabled:opacity-60">
                        {stageSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                        Save changes
                      </button>

                      {/* Stage fields section */}
                      <div className="pt-3 border-t border-console-border/40">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-medium text-console-text flex items-center gap-1.5">
                            <ListChecks className="w-3 h-3" />
                            Fields in this stage
                            {stageFields.length > 0 && (
                              <span className="text-[10px] px-1.5 rounded-full bg-[#58a6ff]/20 text-[#58a6ff]">{stageFields.length}</span>
                            )}
                          </p>
                          {!showAddStageField && (
                            <button onClick={() => setShowAddStageField(true)}
                              className="flex items-center gap-1 text-[10px] text-console-muted hover:text-console-text transition-colors">
                              <Plus className="w-3 h-3" /> Add
                            </button>
                          )}
                        </div>

                        {stageFieldsLoading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-console-muted mx-auto" />
                        ) : stageFields.length === 0 && !showAddStageField ? (
                          <p className="text-[10px] text-console-muted/50 py-1">No fields. Click Add to attach fields to this stage.</p>
                        ) : (
                          <div className="space-y-1 mb-2">
                            {stageFields.map((f) => (
                              <div key={f.id} className="flex items-center gap-2 px-2 py-1.5 rounded-md border border-console-border/50 bg-[#0d1117]/30">
                                <span className="font-mono text-[10px] text-console-accent flex-1 truncate">{f.fieldKey}</span>
                                <span className="text-[10px] text-console-muted truncate">{f.label}</span>
                                <span className="text-[10px] px-1 rounded bg-[#30363d] text-console-muted font-mono shrink-0">{f.fieldType}</span>
                                {f.required && <span className="text-[9px] text-[#f85149] shrink-0">req</span>}
                                <button onClick={() => handleDeleteStageField(f.id)}
                                  className="text-console-muted/30 hover:text-[#f85149] transition-colors shrink-0">
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {showAddStageField && (
                          <div className="border border-console-border/60 rounded-md p-2.5 mt-1 space-y-2 bg-[#0d1117]/40">
                            <div className="grid grid-cols-2 gap-2">
                              <input className={inputCls} placeholder="fieldKey" value={newStageField.fieldKey}
                                onChange={(e) => setNewStageField((p) => ({ ...p, fieldKey: e.target.value }))} />
                              <select className={selectCls} value={newStageField.fieldType}
                                onChange={(e) => setNewStageField((p) => ({ ...p, fieldType: e.target.value }))}>
                                {FIELD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                              </select>
                            </div>
                            <input className={inputCls} placeholder="Label" value={newStageField.label}
                              onChange={(e) => setNewStageField((p) => ({ ...p, label: e.target.value }))} />
                            <label className="flex items-center gap-2 text-xs text-console-muted cursor-pointer">
                              <input type="checkbox" checked={newStageField.required}
                                onChange={(e) => setNewStageField((p) => ({ ...p, required: e.target.checked }))} />
                              Required
                            </label>
                            <div className="flex gap-1">
                              <button onClick={handleAddStageField} disabled={stageFieldSaving || !newStageField.fieldKey || !newStageField.label}
                                className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-console-accent text-white rounded-md disabled:opacity-60">
                                {stageFieldSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Save
                              </button>
                              <button onClick={() => setShowAddStageField(false)} className="px-2.5 py-1.5 text-xs border border-console-border/50 rounded-md text-console-muted">
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-console-border/40">
                        <p className="text-[10px] text-console-muted/40 font-mono">stageKey: {selectedStage.stageKey}</p>
                        <p className="text-[10px] text-console-muted/40 font-mono">sortOrder: {selectedStage.sortOrder}</p>
                        <p className="text-[10px] text-console-muted/40 font-mono">
                          scope: {selectedStage.combinedCodeId ? generatedCode : 'global'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty state when incomplete */}
        {!complete && (
          <div className="bg-console-sidebar border border-console-border/50 rounded-lg p-4 text-center">
            <Zap className="w-8 h-8 text-console-muted/20 mx-auto mb-2" />
            <p className="text-xs text-console-muted/60">Complete all 6 selections to resolve the combined code</p>
          </div>
        )}
      </div>

      {/* ── Edit field dialog ─────────────────────────────────────────────── */}
      {editingField && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setEditingField(null)}>
          <div className="bg-console-sidebar border border-console-border rounded-lg p-5 w-full max-w-sm space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-console-text">Edit Field</p>
              <button onClick={() => setEditingField(null)} className="text-console-muted hover:text-console-text"><X className="w-4 h-4" /></button>
            </div>
            <p className="font-mono text-xs text-console-accent">{editingField.fieldKey}</p>

            <div>
              <label className="text-[10px] text-console-muted uppercase tracking-wide block mb-1">Label</label>
              <input className={inputCls} value={editingField.label}
                onChange={(e) => setEditingField((p) => p ? { ...p, label: e.target.value } : p)} />
            </div>
            <div>
              <label className="text-[10px] text-console-muted uppercase tracking-wide block mb-1">Type</label>
              <select className={selectCls} value={editingField.fieldType}
                onChange={(e) => setEditingField((p) => p ? { ...p, fieldType: e.target.value } : p)}>
                {FIELD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-console-muted uppercase tracking-wide block mb-1">Placeholder</label>
              <input className={inputCls} value={editingField.placeholder ?? ''}
                onChange={(e) => setEditingField((p) => p ? { ...p, placeholder: e.target.value } : p)} />
            </div>
            <div>
              <label className="text-[10px] text-console-muted uppercase tracking-wide block mb-1">Help Text</label>
              <input className={inputCls} value={editingField.helpText ?? ''}
                onChange={(e) => setEditingField((p) => p ? { ...p, helpText: e.target.value } : p)} />
            </div>
            <label className="flex items-center gap-2 text-xs text-console-muted cursor-pointer">
              <input type="checkbox" checked={editingField.required}
                onChange={(e) => setEditingField((p) => p ? { ...p, required: e.target.checked } : p)} />
              Required field
            </label>
            <div className="flex gap-2 pt-1">
              <button onClick={handleSaveFieldEdit} disabled={fieldSaving}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs bg-console-accent text-white rounded-md hover:bg-console-accent/80 disabled:opacity-60">
                {fieldSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Save
              </button>
              <button onClick={() => setEditingField(null)} className="px-4 py-2 text-xs border border-console-border/50 rounded-md text-console-muted hover:text-console-text">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Step card sub-component ────────────────────────────────────────────────────
function Step({ n, color, label, disabled, hint, children }: {
  n: number; color: string; label: string;
  disabled?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className={`bg-console-sidebar border border-console-border rounded-lg p-4 transition-opacity ${disabled ? 'opacity-40' : ''}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold" style={{ background: color + '22', color }}>
          {n}
        </span>
        <span className="text-xs font-semibold text-console-text">{label}</span>
        {disabled && hint && <span className="text-xs text-console-muted/50 ml-1">— {hint}</span>}
      </div>
      {children}
    </div>
  );
}

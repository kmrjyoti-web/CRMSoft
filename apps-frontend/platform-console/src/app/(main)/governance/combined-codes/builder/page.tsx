'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Zap, ChevronRight, CheckCircle2, XCircle, Loader2, Save, RotateCcw,
  Plus, Pencil, Trash2, X, Check, Users, ListChecks, Layers,
} from 'lucide-react';
import { api } from '@/lib/api';

// ── Types ─────────────────────────────────────────────────────────────────────

type Partner  = { id: string; code: string; shortCode: string; name: string };
type Brand    = { id: string; code: string; shortCode?: string; name: string };
type Edition  = { id: string; code: string; shortCode?: string; name: string };
type Vertical = { id: string; typeCode: string; typeName: string };
type SubType  = {
  id: string; code: string; shortCode: string; name: string; userType: string;
  allowedBusinessModes: string[];
};

type RegField = {
  fieldKey: string; fieldType: string; label: string;
  placeholder?: string; helpText?: string; required: boolean;
};

type MasterCode = {
  id: string; masterCode: string;
  partnerCode: string; editionCode: string; brandCode: string; verticalCode: string;
  displayName: string; description?: string;
  commonRegFields: RegField[];
  commonOnboardingStages: unknown[];
  isActive: boolean;
  configs: MasterConfig[];
};

type MasterConfig = {
  id: string; masterCodeId: string;
  userTypeCode: string; subTypeCode?: string;
  resolvedCode: string; displayName: string;
  extraRegFields: RegField[];
  overrideOnboardingStages: unknown[] | null;
  isActive: boolean;
};

const USER_TYPES = [
  { code: 'B2B',    label: 'Business (B2B)' },
  { code: 'B2C',    label: 'Business (B2C)' },
  { code: 'IND_SP', label: 'Service Provider' },
  { code: 'IND_EE', label: 'Employee' },
];

const FIELD_TYPES = ['text', 'email', 'phone', 'number', 'select', 'checkbox', 'date', 'textarea', 'file', 'url'];

const selectCls = 'w-full text-xs bg-[#0d1117] border border-console-border rounded-md px-2.5 py-2 text-console-text focus:outline-none focus:border-[#58a6ff]';
const inputCls  = 'w-full text-xs bg-[#0d1117] border border-console-border rounded-md px-2.5 py-2 text-console-text focus:outline-none focus:border-[#58a6ff]';

// ── Main component ─────────────────────────────────────────────────────────────

export default function MasterCodeBuilderPage() {
  const searchParams = useSearchParams();

  // Left-panel selections
  const [partner,  setPartner]  = useState('');
  const [edition,  setEdition]  = useState('');
  const [brand,    setBrand]    = useState('');
  const [vertical, setVertical] = useState('');

  // Lookup data
  const [partners,  setPartners]  = useState<Partner[]>([]);
  const [editions,  setEditions]  = useState<Edition[]>([]);
  const [brands,    setBrands]    = useState<Brand[]>([]);
  const [verticals, setVerticals] = useState<Vertical[]>([]);

  // Master code state
  const [master,        setMaster]        = useState<MasterCode | null | 'not-found'>(null);
  const [masterChecking, setMasterChecking] = useState(false);
  const [masterSaving,   setMasterSaving]   = useState(false);
  const [masterError,    setMasterError]    = useState('');

  // Common fields tab state
  const [activeTab, setActiveTab] = useState<'fields' | 'stages' | 'configs'>('configs');
  const [showAddCommonField, setShowAddCommonField] = useState(false);
  const [newCommonField,     setNewCommonField]     = useState<RegField>({ fieldKey: '', fieldType: 'text', label: '', required: false });
  const [commonFieldSaving,  setCommonFieldSaving]  = useState(false);

  // Config drawer state
  const [configDrawer,  setConfigDrawer]  = useState<'closed' | 'new' | MasterConfig>('closed');
  const [configSaving,  setConfigSaving]  = useState(false);
  const [configError,   setConfigError]   = useState('');
  const [drawerSubTypes, setDrawerSubTypes] = useState<SubType[]>([]);
  const [configForm, setConfigForm] = useState({
    userTypeCode: '', subTypeCode: '', displayName: '',
    extraRegFields: [] as RegField[],
    useOverrideStages: false,
  });
  const [showAddExtraField,  setShowAddExtraField]  = useState(false);
  const [newExtraField,      setNewExtraField]      = useState<RegField>({ fieldKey: '', fieldType: 'text', label: '', required: false });

  // ── Load reference data ────────────────────────────────────────────────────

  useEffect(() => {
    Promise.all([
      api.pcConfig.partners() as Promise<Partner[]>,
      api.pcConfig.brands()   as Promise<Brand[]>,
      api.pcConfig.crmEditions() as Promise<Edition[]>,
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
      setVertical('');
    }).catch(() => setVerticals([]));
  }, [edition]);

  // Load sub-types when config drawer user type + vertical changes
  useEffect(() => {
    if (!configForm.userTypeCode || !vertical) { setDrawerSubTypes([]); return; }
    api.pcConfig.subTypes(vertical, configForm.userTypeCode)
      .then((data) => setDrawerSubTypes(Array.isArray(data) ? data as SubType[] : []))
      .catch(() => setDrawerSubTypes([]));
  }, [configForm.userTypeCode, vertical]);

  // ── Derived values ─────────────────────────────────────────────────────────

  const brandObj    = brands.find((b)   => b.code === brand);
  const verticalObj = verticals.find((v) => v.typeCode === vertical);

  const complete = !!(partner && edition && brand && vertical);

  const generatedMasterCode = useMemo(() => {
    if (!complete) return '';
    return `${partner}_${edition}_${brand}_${vertical}`;
  }, [complete, partner, edition, brand, vertical]);

  const masterExists = master !== null && master !== 'not-found';

  // ── Master code lookup ─────────────────────────────────────────────────────

  const lookupMaster = useCallback(async (pc: string, ec: string, bc: string, vc: string) => {
    setMasterChecking(true);
    setMaster(null);
    setMasterError('');
    try {
      const list = await api.pcConfig.masterCodes({ partnerCode: pc, brandCode: bc, verticalCode: vc }) as MasterCode[];
      const found = Array.isArray(list) ? list.find((m) => m.editionCode === ec) ?? null : null;
      if (found) {
        const detail = await api.pcConfig.masterCode(found.id) as MasterCode;
        setMaster(detail);
      } else {
        setMaster('not-found');
      }
    } catch {
      setMaster('not-found');
    } finally {
      setMasterChecking(false);
    }
  }, []);

  useEffect(() => {
    if (complete) lookupMaster(partner, edition, brand, vertical);
    else setMaster(null);
  }, [complete, partner, edition, brand, vertical, lookupMaster]);

  // Pre-load from ?masterId= URL param
  useEffect(() => {
    const masterId = searchParams.get('masterId');
    if (!masterId) return;
    api.pcConfig.masterCode(masterId).then((m) => {
      const mc = m as MasterCode;
      setPartner(mc.partnerCode);
      setEdition(mc.editionCode);
      setBrand(mc.brandCode);
      setVertical(mc.verticalCode);
      setMaster(mc);
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Master code create ─────────────────────────────────────────────────────

  const handleCreateMaster = async () => {
    if (!complete) return;
    setMasterSaving(true); setMasterError('');
    try {
      const created = await api.pcConfig.createMasterCode({
        partnerCode: partner, editionCode: edition, brandCode: brand, verticalCode: vertical,
        displayName: `${brandObj?.name ?? brand} / ${verticalObj?.typeName ?? vertical}`,
      }) as MasterCode;
      await lookupMaster(partner, edition, brand, vertical);
      void created;
    } catch (err: any) {
      setMasterError(err.message ?? 'Create failed');
    } finally {
      setMasterSaving(false);
    }
  };

  // ── Common reg fields ──────────────────────────────────────────────────────

  const handleAddCommonField = async () => {
    if (!masterExists || !newCommonField.fieldKey || !newCommonField.label) return;
    const m = master as MasterCode;
    setCommonFieldSaving(true);
    try {
      const updated = [...(m.commonRegFields ?? []), newCommonField];
      await api.pcConfig.updateMasterCode(m.id, { commonRegFields: updated });
      setMaster({ ...m, commonRegFields: updated });
      setNewCommonField({ fieldKey: '', fieldType: 'text', label: '', required: false });
      setShowAddCommonField(false);
    } finally { setCommonFieldSaving(false); }
  };

  const handleRemoveCommonField = async (idx: number) => {
    if (!masterExists) return;
    const m = master as MasterCode;
    const updated = (m.commonRegFields ?? []).filter((_, i) => i !== idx);
    await api.pcConfig.updateMasterCode(m.id, { commonRegFields: updated }).catch(() => {});
    setMaster({ ...m, commonRegFields: updated });
  };

  // ── Config drawer ──────────────────────────────────────────────────────────

  const openNewConfig = () => {
    setConfigForm({ userTypeCode: '', subTypeCode: '', displayName: '', extraRegFields: [], useOverrideStages: false });
    setConfigError('');
    setShowAddExtraField(false);
    setConfigDrawer('new');
  };

  const openEditConfig = (cfg: MasterConfig) => {
    setConfigForm({
      userTypeCode: cfg.userTypeCode,
      subTypeCode: cfg.subTypeCode ?? '',
      displayName: cfg.displayName,
      extraRegFields: Array.isArray(cfg.extraRegFields) ? cfg.extraRegFields : [],
      useOverrideStages: !!(cfg.overrideOnboardingStages && (cfg.overrideOnboardingStages as unknown[]).length > 0),
    });
    setConfigError('');
    setShowAddExtraField(false);
    setConfigDrawer(cfg);
  };

  const handleSaveConfig = async () => {
    if (!masterExists || !configForm.userTypeCode || !configForm.displayName) return;
    const m = master as MasterCode;
    setConfigSaving(true); setConfigError('');
    try {
      if (configDrawer === 'new') {
        await api.pcConfig.createMasterCodeConfig(m.id, {
          userTypeCode: configForm.userTypeCode,
          subTypeCode: configForm.subTypeCode || undefined,
          displayName: configForm.displayName,
          extraRegFields: configForm.extraRegFields,
        });
      } else {
        const cfg = configDrawer as MasterConfig;
        await api.pcConfig.updateMasterCodeConfig(m.id, cfg.id, {
          displayName: configForm.displayName,
          extraRegFields: configForm.extraRegFields,
        });
      }
      const detail = await api.pcConfig.masterCode(m.id) as MasterCode;
      setMaster(detail);
      setConfigDrawer('closed');
    } catch (err: any) {
      setConfigError(err.message ?? 'Save failed');
    } finally { setConfigSaving(false); }
  };

  const handleDeleteConfig = async (cfg: MasterConfig) => {
    if (!masterExists || !confirm(`Remove config "${cfg.resolvedCode}"?`)) return;
    const m = master as MasterCode;
    await api.pcConfig.deleteMasterCodeConfig(m.id, cfg.id).catch(() => {});
    const detail = await api.pcConfig.masterCode(m.id) as MasterCode;
    setMaster(detail);
  };

  const handleAddExtraField = () => {
    if (!newExtraField.fieldKey || !newExtraField.label) return;
    setConfigForm((p) => ({ ...p, extraRegFields: [...p.extraRegFields, { ...newExtraField }] }));
    setNewExtraField({ fieldKey: '', fieldType: 'text', label: '', required: false });
    setShowAddExtraField(false);
  };

  const handleRemoveExtraField = (idx: number) => {
    setConfigForm((p) => ({ ...p, extraRegFields: p.extraRegFields.filter((_, i) => i !== idx) }));
  };

  const resetAll = () => {
    setPartner(''); setEdition(''); setBrand(''); setVertical('');
    setMaster(null); setMasterError('');
  };

  // ── Segments for the code banner ───────────────────────────────────────────

  const masterSegments = [
    { label: 'Partner',  value: partner  || undefined, color: '#58a6ff' },
    { label: 'Edition',  value: edition  || undefined, color: '#3fb950' },
    { label: 'Brand',    value: brand    || undefined, color: '#d29922' },
    { label: 'Vertical', value: vertical || undefined, color: '#bc8cff' },
  ];

  const configs = masterExists ? ((master as MasterCode).configs ?? []) : [];

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex gap-6 items-start">

      {/* ── LEFT: 4-step selector ─────────────────────────────────────────── */}
      <div className="w-72 shrink-0 space-y-3">
        <div>
          <h2 className="text-base font-semibold text-console-text flex items-center gap-2">
            <Zap className="w-4 h-4 text-console-accent" />
            Master Code Builder
          </h2>
          <p className="text-xs text-console-muted mt-0.5">Select 4 dimensions to define a master code</p>
        </div>

        <Step n={1} color="#58a6ff" label="Partner">
          <select value={partner} onChange={(e) => { setPartner(e.target.value); }} className={selectCls}>
            <option value="">Select partner…</option>
            {partners.map((p) => <option key={p.code} value={p.code}>{p.name} ({p.shortCode})</option>)}
          </select>
        </Step>

        <Step n={2} color="#3fb950" label="CRM Edition">
          <select value={edition} onChange={(e) => { setEdition(e.target.value); }} className={selectCls}>
            <option value="">Select edition…</option>
            {editions.map((e) => <option key={e.code} value={e.code}>{e.name} ({e.shortCode ?? e.code})</option>)}
          </select>
        </Step>

        <Step n={3} color="#d29922" label="Brand">
          <select value={brand} onChange={(e) => { setBrand(e.target.value); }} className={selectCls}>
            <option value="">Select brand…</option>
            {brands.map((b) => <option key={b.code} value={b.code}>{b.name} ({b.shortCode ?? b.code})</option>)}
          </select>
        </Step>

        <Step n={4} color="#bc8cff" label="Vertical" disabled={!edition} hint="select edition first">
          <select value={vertical} disabled={!edition} onChange={(e) => { setVertical(e.target.value); }}
            className={selectCls + ' disabled:cursor-not-allowed disabled:opacity-50'}>
            <option value="">Select vertical…</option>
            {verticals.map((v) => <option key={v.typeCode} value={v.typeCode}>{v.typeName}</option>)}
          </select>
        </Step>

        <button onClick={resetAll} className="flex items-center gap-1.5 text-xs text-console-muted hover:text-console-text transition-colors">
          <RotateCcw className="w-3 h-3" /> Reset all
        </button>
      </div>

      {/* ── RIGHT: Master code panel ──────────────────────────────────────── */}
      <div className="flex-1 min-w-0 space-y-4">

        {/* Generated master code banner */}
        <div className="bg-console-sidebar border border-console-border rounded-lg p-4">
          <p className="text-xs font-semibold text-console-text mb-3">Master Code</p>
          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            {masterSegments.map((seg, i) => (
              <span key={seg.label} className="flex items-center gap-1.5">
                <span className="px-2 py-1 rounded text-xs font-mono"
                  style={{ backgroundColor: seg.value ? seg.color + '22' : '#30363d', color: seg.value ? seg.color : '#6e7681', border: `1px solid ${seg.value ? seg.color + '44' : 'transparent'}` }}>
                  {seg.value ?? `[${seg.label}]`}
                </span>
                {i < masterSegments.length - 1 && <ChevronRight className="w-3 h-3 text-console-muted/40" />}
              </span>
            ))}
          </div>
          {generatedMasterCode && (
            <div className="bg-[#0d1117] rounded-md px-3 py-2 flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-console-accent">{generatedMasterCode}</span>
              {masterChecking && <Loader2 className="w-3.5 h-3.5 animate-spin text-console-muted ml-auto" />}
            </div>
          )}
        </div>

        {/* Master code lookup result */}
        {master !== null && (
          <div className={`border rounded-lg p-4 ${masterExists ? 'bg-[#238636]/10 border-[#238636]/30' : 'bg-[#30363d]/30 border-console-border'}`}>
            {master === 'not-found' ? (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <XCircle className="w-4 h-4 text-console-muted" />
                  <span className="text-xs text-console-muted">No master code found — create it to start adding user type configs</span>
                </div>
                {masterError && <p className="text-xs text-[#f85149] mb-2">{masterError}</p>}
                <button onClick={handleCreateMaster} disabled={masterSaving}
                  className="flex items-center gap-2 px-4 py-2 text-xs bg-console-accent text-white rounded-md hover:bg-console-accent/80 transition-colors disabled:opacity-60">
                  {masterSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  {masterSaving ? 'Creating…' : `Create ${generatedMasterCode}`}
                </button>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-[#3fb950]" />
                    <span className="text-xs font-semibold text-[#3fb950]">Master code exists</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${(master as MasterCode).isActive ? 'bg-[#238636]/20 text-[#3fb950]' : 'bg-[#30363d] text-console-muted'}`}>
                      {(master as MasterCode).isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="font-mono text-sm text-console-text">{(master as MasterCode).masterCode}</p>
                  <p className="text-xs text-console-muted mt-0.5">{(master as MasterCode).displayName}</p>
                </div>
                <span className="text-xs text-console-muted shrink-0">
                  {configs.length} config{configs.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Empty state when incomplete */}
        {!complete && master === null && (
          <div className="bg-console-sidebar border border-console-border/50 rounded-lg p-8 text-center">
            <Zap className="w-8 h-8 text-console-muted/20 mx-auto mb-2" />
            <p className="text-xs text-console-muted/60">Complete all 4 selections to resolve the master code</p>
          </div>
        )}

        {/* Tabs — only shown when master exists */}
        {masterExists && (
          <div className="bg-console-sidebar border border-console-border rounded-lg overflow-hidden">
            <div className="flex border-b border-console-border">
              {[
                { id: 'configs', label: 'User Type Configs', icon: Users, color: '#ff7b72', count: configs.length },
                { id: 'fields',  label: 'Common Reg Fields',  icon: ListChecks, color: '#bc8cff', count: (master as MasterCode).commonRegFields?.length ?? 0 },
                { id: 'stages',  label: 'Common Stages',  icon: Layers, color: '#58a6ff', count: ((master as MasterCode).commonOnboardingStages as unknown[])?.length ?? 0 },
              ].map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-px ${activeTab === tab.id ? `border-[${tab.color}] text-[${tab.color}]` : 'border-transparent text-console-muted hover:text-console-text'}`}
                  style={{ borderBottomColor: activeTab === tab.id ? tab.color : 'transparent', color: activeTab === tab.id ? tab.color : undefined }}>
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px]"
                      style={{ background: tab.color + '22', color: tab.color }}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* ── TAB: User Type Configs ─────────────────────────────────── */}
            {activeTab === 'configs' && (
              <div className="p-4 space-y-3">
                {configs.length === 0 ? (
                  <p className="text-xs text-console-muted/60 py-2">No user type configs yet. Add the first one below.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {configs.map((cfg) => (
                      <ConfigCard key={cfg.id} cfg={cfg} onEdit={openEditConfig} onDelete={handleDeleteConfig} />
                    ))}
                  </div>
                )}
                <button onClick={openNewConfig}
                  className="flex items-center gap-1.5 text-xs text-console-accent hover:text-console-accent/80 transition-colors border border-console-accent/30 hover:border-console-accent/60 rounded-md px-3 py-2 w-full justify-center">
                  <Plus className="w-3.5 h-3.5" /> Add User Type Config
                </button>
              </div>
            )}

            {/* ── TAB: Common Registration Fields ───────────────────────── */}
            {activeTab === 'fields' && (
              <div className="p-4 space-y-2">
                <p className="text-[10px] text-console-muted/60 mb-3">
                  These fields are shared across ALL user types. Per-type extras are configured inside each user type config.
                </p>
                <FieldList
                  fields={(master as MasterCode).commonRegFields ?? []}
                  onRemove={handleRemoveCommonField}
                />
                {!showAddCommonField ? (
                  <button onClick={() => setShowAddCommonField(true)}
                    className="flex items-center gap-1.5 text-xs text-console-muted hover:text-console-text transition-colors mt-1">
                    <Plus className="w-3.5 h-3.5" /> Add common field
                  </button>
                ) : (
                  <AddFieldForm
                    value={newCommonField} onChange={setNewCommonField}
                    onSave={handleAddCommonField} onCancel={() => setShowAddCommonField(false)}
                    saving={commonFieldSaving}
                  />
                )}
              </div>
            )}

            {/* ── TAB: Common Stages ────────────────────────────────────── */}
            {activeTab === 'stages' && (
              <div className="p-4">
                <p className="text-[10px] text-console-muted/60 mb-3">
                  Common onboarding stages inherited by all user types. Per-type overrides are set in the config drawer.
                </p>
                {(((master as MasterCode).commonOnboardingStages as unknown[]) ?? []).length === 0 ? (
                  <p className="text-xs text-console-muted/50 py-2">No common stages configured.</p>
                ) : (
                  <div className="space-y-1">
                    {((master as MasterCode).commonOnboardingStages as { stageKey: string; stageLabel: string; componentName: string }[]).map((s, i) => (
                      <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-md border border-console-border/60 text-xs">
                        <span className="text-console-muted/50 font-mono w-4 shrink-0">{i + 1}</span>
                        <span className="text-console-text flex-1">{s.stageLabel}</span>
                        <span className="font-mono text-[10px] text-console-muted/60">{s.stageKey}</span>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-[10px] text-console-muted/40 mt-3">
                  Manage stages via the migration script or API. UI editor coming in Sprint 5.3.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Config Drawer (modal) ─────────────────────────────────────────── */}
      {configDrawer !== 'closed' && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-end p-4"
          onClick={() => setConfigDrawer('closed')}>
          <div className="bg-console-sidebar border border-console-border rounded-lg w-full max-w-md h-full max-h-[calc(100vh-2rem)] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-console-sidebar border-b border-console-border px-5 py-3.5 flex items-center justify-between z-10">
              <p className="text-sm font-semibold text-console-text">
                {configDrawer === 'new' ? 'Add User Type Config' : 'Edit Config'}
              </p>
              <button onClick={() => setConfigDrawer('closed')} className="text-console-muted hover:text-console-text">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* User Type */}
              <div>
                <label className="text-[10px] text-console-muted uppercase tracking-wide block mb-1.5">User Type *</label>
                {configDrawer === 'new' ? (
                  <div className="grid grid-cols-2 gap-2">
                    {USER_TYPES.map((ut) => (
                      <button key={ut.code} onClick={() => setConfigForm((p) => ({ ...p, userTypeCode: ut.code, subTypeCode: '' }))}
                        className={`px-3 py-2 text-xs rounded-md border transition-colors text-left ${configForm.userTypeCode === ut.code ? 'border-[#ff7b72] bg-[#ff7b72]/10 text-[#ff7b72]' : 'border-console-border text-console-muted hover:border-[#ff7b72]/50 hover:text-console-text'}`}>
                        {ut.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-2.5 py-2 rounded-md border border-console-border/50 bg-[#0d1117]/50 text-xs text-console-muted font-mono">
                    {configForm.userTypeCode}
                    <span className="ml-2 text-[10px] text-console-muted/40">(cannot change after creation)</span>
                  </div>
                )}
              </div>

              {/* Sub-Type */}
              {configForm.userTypeCode && (
                <div>
                  <label className="text-[10px] text-console-muted uppercase tracking-wide block mb-1.5">Sub-Type</label>
                  {configDrawer === 'new' ? (
                    drawerSubTypes.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {drawerSubTypes.map((s) => (
                          <button key={s.code} onClick={() => setConfigForm((p) => ({ ...p, subTypeCode: s.shortCode }))}
                            className={`px-3 py-2 text-xs rounded-md border transition-colors text-left ${configForm.subTypeCode === s.shortCode ? 'border-[#79c0ff] bg-[#79c0ff]/10 text-[#79c0ff]' : 'border-console-border text-console-muted hover:border-[#79c0ff]/50'}`}>
                            <span className="font-mono">{s.shortCode}</span>
                            <span className="ml-1 text-console-muted/70"> {s.name}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-console-muted/50">No sub-types for this user type + vertical combination.</p>
                    )
                  ) : (
                    <div className="px-2.5 py-2 rounded-md border border-console-border/50 bg-[#0d1117]/50 text-xs font-mono text-console-muted">
                      {configForm.subTypeCode || '(none)'}
                    </div>
                  )}
                </div>
              )}

              {/* Display Name */}
              <div>
                <label className="text-[10px] text-console-muted uppercase tracking-wide block mb-1.5">Display Name *</label>
                <input className={inputCls} value={configForm.displayName}
                  onChange={(e) => setConfigForm((p) => ({ ...p, displayName: e.target.value }))}
                  placeholder="e.g. B2B Consumer App Provider" />
              </div>

              {/* Resolved Code preview */}
              {configForm.userTypeCode && masterExists && (
                <div>
                  <label className="text-[10px] text-console-muted uppercase tracking-wide block mb-1.5">Resolved Code (auto)</label>
                  <div className="px-2.5 py-2 rounded-md bg-[#0d1117] border border-console-border/50 font-mono text-xs text-console-accent">
                    {configDrawer !== 'new'
                      ? (configDrawer as MasterConfig).resolvedCode
                      : `${configForm.userTypeCode}_${edition}_${brand}${configForm.subTypeCode ? '_' + configForm.subTypeCode : ''}`}
                  </div>
                </div>
              )}

              {/* Extra Registration Fields */}
              <div>
                <label className="text-[10px] text-console-muted uppercase tracking-wide block mb-1.5">
                  Extra Registration Fields
                  <span className="ml-1 text-console-muted/40">(added on top of common fields)</span>
                </label>
                <FieldList
                  fields={configForm.extraRegFields}
                  onRemove={(idx) => handleRemoveExtraField(idx)}
                />
                {!showAddExtraField ? (
                  <button onClick={() => setShowAddExtraField(true)}
                    className="flex items-center gap-1.5 text-xs text-console-muted hover:text-console-text transition-colors mt-1">
                    <Plus className="w-3.5 h-3.5" /> Add extra field
                  </button>
                ) : (
                  <AddFieldForm
                    value={newExtraField} onChange={setNewExtraField}
                    onSave={handleAddExtraField} onCancel={() => setShowAddExtraField(false)}
                    saving={false}
                  />
                )}
              </div>

              {/* Error */}
              {configError && <p className="text-xs text-[#f85149]">{configError}</p>}

              {/* Save */}
              <div className="flex gap-2 pt-1">
                <button onClick={handleSaveConfig}
                  disabled={configSaving || !configForm.userTypeCode || !configForm.displayName}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs bg-console-accent text-white rounded-md hover:bg-console-accent/80 disabled:opacity-60">
                  {configSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  {configSaving ? 'Saving…' : 'Save Config'}
                </button>
                <button onClick={() => setConfigDrawer('closed')}
                  className="px-4 py-2 text-xs border border-console-border/50 rounded-md text-console-muted hover:text-console-text">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function Step({ n, color, label, disabled, hint, children }: {
  n: number; color: string; label: string;
  disabled?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className={`bg-console-sidebar border border-console-border rounded-lg p-4 transition-opacity ${disabled ? 'opacity-40' : ''}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold"
          style={{ background: color + '22', color }}>
          {n}
        </span>
        <span className="text-xs font-semibold text-console-text">{label}</span>
        {disabled && hint && <span className="text-xs text-console-muted/50 ml-1">— {hint}</span>}
      </div>
      {children}
    </div>
  );
}

function ConfigCard({ cfg, onEdit, onDelete }: {
  cfg: MasterConfig;
  onEdit: (cfg: MasterConfig) => void;
  onDelete: (cfg: MasterConfig) => void;
}) {
  return (
    <div className="bg-[#0d1117]/60 border border-console-border/80 rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="px-2 py-0.5 rounded text-xs font-mono font-bold" style={{ background: '#ff7b7222', color: '#ff7b72', border: '1px solid #ff7b7244' }}>
          {cfg.userTypeCode}
        </span>
        <span className={`text-[10px] px-1.5 py-0.5 rounded ${cfg.isActive ? 'bg-[#238636]/20 text-[#3fb950]' : 'bg-[#30363d] text-console-muted'}`}>
          {cfg.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>
      {cfg.subTypeCode && (
        <p className="text-[10px] text-console-muted">Sub-type: <span className="font-mono text-console-text">{cfg.subTypeCode}</span></p>
      )}
      <p className="text-xs text-console-text truncate">{cfg.displayName}</p>
      <p className="text-[10px] text-console-muted/60">Extra fields: {(cfg.extraRegFields as RegField[])?.length ?? 0}</p>
      <div className="bg-[#0d1117] rounded px-2 py-1">
        <span className="font-mono text-[10px] text-console-accent">{cfg.resolvedCode}</span>
      </div>
      <div className="flex gap-1.5 pt-1">
        <button onClick={() => onEdit(cfg)}
          className="flex items-center gap-1 text-[10px] text-console-muted hover:text-[#58a6ff] border border-console-border/50 hover:border-[#58a6ff]/40 rounded px-2 py-1 transition-colors">
          <Pencil className="w-3 h-3" /> Edit
        </button>
        <button onClick={() => onDelete(cfg)}
          className="flex items-center gap-1 text-[10px] text-console-muted hover:text-[#f85149] border border-console-border/50 hover:border-[#f85149]/40 rounded px-2 py-1 transition-colors">
          <Trash2 className="w-3 h-3" /> Delete
        </button>
      </div>
    </div>
  );
}

function FieldList({ fields, onRemove }: { fields: RegField[]; onRemove: (idx: number) => void }) {
  if (fields.length === 0) return null;
  return (
    <div className="space-y-1 mb-2">
      {fields.map((f, idx) => (
        <div key={idx} className="flex items-center gap-2 px-2 py-1.5 rounded-md border border-console-border/60 bg-[#0d1117]/30">
          <span className="font-mono text-[10px] text-console-accent w-24 shrink-0 truncate">{f.fieldKey}</span>
          <span className="text-xs text-console-text flex-1 truncate">{f.label}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#30363d] text-console-muted font-mono shrink-0">{f.fieldType}</span>
          {f.required && <span className="text-[9px] text-[#f85149] shrink-0">req</span>}
          <button onClick={() => onRemove(idx)} className="text-console-muted/30 hover:text-[#f85149] transition-colors shrink-0">
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  );
}

function AddFieldForm({ value, onChange, onSave, onCancel, saving }: {
  value: RegField; onChange: (v: RegField) => void;
  onSave: () => void; onCancel: () => void; saving: boolean;
}) {
  const cls = 'w-full text-xs bg-[#0d1117] border border-console-border rounded-md px-2.5 py-2 text-console-text focus:outline-none focus:border-[#58a6ff]';
  return (
    <div className="border border-console-border/60 rounded-md p-3 mt-2 space-y-2 bg-[#0d1117]/50">
      <p className="text-xs font-medium text-console-text mb-2">New Field</p>
      <div className="grid grid-cols-2 gap-2">
        <input className={cls} placeholder="fieldKey" value={value.fieldKey}
          onChange={(e) => onChange({ ...value, fieldKey: e.target.value })} />
        <select className={cls} value={value.fieldType}
          onChange={(e) => onChange({ ...value, fieldType: e.target.value })}>
          {FIELD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <input className={cls} placeholder="Label" value={value.label}
        onChange={(e) => onChange({ ...value, label: e.target.value })} />
      <input className={cls} placeholder="Placeholder (optional)" value={value.placeholder ?? ''}
        onChange={(e) => onChange({ ...value, placeholder: e.target.value })} />
      <label className="flex items-center gap-2 text-xs text-console-muted cursor-pointer">
        <input type="checkbox" checked={value.required}
          onChange={(e) => onChange({ ...value, required: e.target.checked })} className="rounded" />
        Required field
      </label>
      <div className="flex gap-2 pt-1">
        <button onClick={onSave} disabled={saving || !value.fieldKey || !value.label}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-console-accent text-white rounded-md hover:bg-console-accent/80 disabled:opacity-60">
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Save
        </button>
        <button onClick={onCancel} className="px-3 py-1.5 text-xs text-console-muted hover:text-console-text border border-console-border/50 rounded-md">
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

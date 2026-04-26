'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Zap, ChevronRight, CheckCircle2, XCircle, Loader2, Save, RotateCcw, ListChecks, Layers } from 'lucide-react';
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
type RegField = { fieldKey: string; label: string; fieldType: string; required: boolean; sortOrder: number };
type OnboardingStage = { stageKey: string; stageLabel: string; componentName: string; required: boolean };

const USER_TYPES = [
  { code: 'B2B', label: 'Business (B2B)' },
  { code: 'B2C', label: 'Business (B2C)' },
  { code: 'IND_SP', label: 'Service Provider' },
  { code: 'IND_EE', label: 'Employee / Job seeker' },
];

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

  // Preview data (loaded after lookup)
  const [regFields, setRegFields] = useState<RegField[]>([]);
  const [stages, setStages] = useState<OnboardingStage[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);

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

  // Load verticals when edition changes
  useEffect(() => {
    if (!edition) { setVerticals([]); setVertical(''); return; }
    api.pcConfig.verticals(edition).then((data) => {
      setVerticals(Array.isArray(data) ? data as Vertical[] : []);
      setVertical('');
      setSubType('');
      setSubTypes([]);
    }).catch(() => setVerticals([]));
  }, [edition]);

  // Load sub-types when vertical + userType change
  useEffect(() => {
    if (!vertical || !userType) { setSubTypes([]); setSubType(''); setSelectedModes([]); return; }
    api.pcConfig.subTypes(vertical, userType).then((data) => {
      setSubTypes(Array.isArray(data) ? data as SubType[] : []);
      setSubType('');
      setSelectedModes([]);
    }).catch(() => setSubTypes([]));
  }, [vertical, userType]);

  // Auto-set modes when sub-type is selected (single-mode → auto-select; multi-mode → clear for user)
  useEffect(() => {
    if (!subTypeObj) { setSelectedModes([]); return; }
    const modes = subTypeObj.allowedBusinessModes as string[];
    if (modes.length === 1) {
      setSelectedModes(modes); // auto-select the only option
    } else if (modes.length === 0) {
      setSelectedModes([]); // Traveler — no modes
    } else {
      // Pre-check default, let user adjust
      setSelectedModes(subTypeObj.defaultBusinessMode ? [subTypeObj.defaultBusinessMode] : []);
    }
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

  // Compute the actual generated code string
  const generatedCode = useMemo(() => {
    if (!complete || !editionObj || !brandObj || !subTypeObj) return '';
    return `${userType}_${editionObj.shortCode ?? editionObj.code}_${brandObj.shortCode ?? brandObj.code}_${subTypeObj.shortCode}`;
  }, [complete, userType, editionObj, brandObj, subTypeObj]);

  // Auto-lookup + load previews when selection is complete
  const lookup = useCallback(async (code: string) => {
    if (!code) return;
    setChecking(true);
    setResult(null);
    setRegFields([]);
    setStages([]);
    setSaved(false);
    setSaveError('');
    try {
      const existing = await api.pcConfig.combinedCode(code) as CombinedCode | null;
      setResult(existing ?? 'not-found');

      // Load preview data regardless (uses global stages if not found)
      setPreviewLoading(true);
      const [fields, onboarding] = await Promise.all([
        existing
          ? (api.pcConfig.registrationForm(code) as Promise<RegField[]>).catch(() => [])
          : Promise.resolve([]),
        (api.pcConfig.onboardingStages(code) as Promise<OnboardingStage[]>).catch(() => []),
      ]);
      setRegFields(Array.isArray(fields) ? fields : []);
      setStages(Array.isArray(onboarding) ? onboarding : []);
    } catch {
      setResult('not-found');
    } finally {
      setChecking(false);
      setPreviewLoading(false);
    }
  }, []);

  // Auto-trigger lookup when all cascade selections are complete
  useEffect(() => {
    if (complete && generatedCode) {
      lookup(generatedCode);
    } else {
      setResult(null);
      setRegFields([]);
      setStages([]);
    }
  }, [complete, generatedCode, lookup]);

  const handleSave = async () => {
    if (!partnerObj || !brandObj || !editionObj || !verticalObj || !subTypeObj || !generatedCode) return;
    setSaving(true);
    setSaveError('');
    try {
      await api.pcConfig.createCombinedCode({
        code: generatedCode,
        partnerId: partnerObj.id,
        brandId: brandObj.id,
        crmEditionId: editionObj.id,
        verticalId: verticalObj.id,
        userType,
        subTypeId: subTypeObj.id,
        displayName: `${brandObj.name} ${subTypeObj.name}`,
        description: `${brandObj.name} ${subTypeObj.name} (${userType})`,
        businessModes: selectedModes,
      });
      setSaved(true);
      // Refresh lookup to show found state
      await lookup(generatedCode);
    } catch (err: any) {
      setSaveError(err.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const resetAll = () => {
    setPartner(''); setBrand(''); setEdition(''); setVertical(''); setUserType(''); setSubType(''); setSelectedModes([]);
    setResult(null); setRegFields([]); setStages([]); setSaved(false); setSaveError('');
  };

  const assembledSegments = [
    { label: 'User Type', value: userType || undefined, color: '#ff7b72' },
    { label: 'CRM Edition', value: editionObj?.shortCode, color: '#3fb950' },
    { label: 'Brand', value: brandObj?.shortCode, color: '#d29922' },
    { label: 'Sub-Type', value: subTypeObj?.shortCode, color: '#79c0ff' },
  ];

  const selectCls = 'w-full text-xs bg-[#0d1117] border border-console-border rounded-md px-2.5 py-2 text-console-text focus:outline-none focus:border-[#58a6ff]';

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
              <button
                key={ut.code}
                disabled={!vertical}
                onClick={() => { setUserType(ut.code); setSubType(''); setResult(null); }}
                className={`px-3 py-2 text-xs rounded-md border transition-colors text-left disabled:cursor-not-allowed disabled:opacity-50 ${userType === ut.code ? 'border-[#ff7b72] bg-[#ff7b72]/10 text-[#ff7b72]' : 'border-console-border text-console-muted hover:border-[#ff7b72]/50 hover:text-console-text'}`}
              >
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
                <button
                  key={s.code}
                  onClick={() => setSubType(s.code)}
                  className={`px-3 py-2 text-xs rounded-md border transition-colors text-left ${subType === s.code ? 'border-[#79c0ff] bg-[#79c0ff]/10 text-[#79c0ff]' : 'border-console-border text-console-muted hover:border-[#79c0ff]/50 hover:text-console-text'}`}
                >
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
                  <button
                    key={m}
                    onClick={() => setSelectedModes((prev) => prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m])}
                    className={`px-3 py-2 text-xs rounded-md border transition-colors ${selectedModes.includes(m) ? 'border-[#e3b341] bg-[#e3b341]/10 text-[#e3b341]' : 'border-console-border text-console-muted hover:border-[#e3b341]/50 hover:text-console-text'}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              {subTypeObj.defaultBusinessMode && (
                <p className="text-xs text-console-muted/50">Default: {subTypeObj.defaultBusinessMode}</p>
              )}
            </div>
          </Step>
        )}

        <button onClick={resetAll} className="flex items-center gap-1.5 text-xs text-console-muted hover:text-console-text transition-colors">
          <RotateCcw className="w-3 h-3" /> Reset all
        </button>
      </div>

      {/* ── RIGHT: Preview panels ─────────────────────────────────────────── */}
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
                  <div className="flex items-center gap-2 text-xs text-[#3fb950]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Saved successfully!
                  </div>
                ) : (
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 text-xs bg-console-accent text-white rounded-md hover:bg-console-accent/80 transition-colors disabled:opacity-60"
                  >
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
                {result.description && <p className="text-xs text-console-muted/70 mt-0.5">{result.description}</p>}
              </div>
            )}
          </div>
        )}

        {/* Registration Fields preview */}
        {(result !== null || previewLoading) && complete && (
          <div className="bg-console-sidebar border border-console-border rounded-lg p-4">
            <p className="text-xs font-semibold text-console-text mb-3 flex items-center gap-1.5">
              <ListChecks className="w-3.5 h-3.5 text-[#bc8cff]" />
              Registration Fields
              {regFields.length > 0 && <span className="ml-auto text-console-muted">{regFields.length} fields</span>}
            </p>
            {previewLoading ? (
              <div className="flex items-center gap-2 py-2"><Loader2 className="w-3.5 h-3.5 animate-spin text-console-muted" /><span className="text-xs text-console-muted">Loading…</span></div>
            ) : regFields.length > 0 ? (
              <div className="space-y-1.5">
                {regFields.map((f) => (
                  <div key={f.fieldKey} className="flex items-center gap-2 py-1.5 border-b border-console-border/50 last:border-0">
                    <span className="font-mono text-xs text-console-accent w-32 shrink-0">{f.fieldKey}</span>
                    <span className="text-xs text-console-text flex-1">{f.label}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-[#30363d] text-console-muted font-mono">{f.fieldType}</span>
                    {f.required && <span className="text-xs text-[#f85149]">required</span>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-console-muted/60 py-1">No registration fields configured for this code</p>
            )}
          </div>
        )}

        {/* Onboarding Stages preview */}
        {(result !== null || previewLoading) && complete && (
          <div className="bg-console-sidebar border border-console-border rounded-lg p-4">
            <p className="text-xs font-semibold text-console-text mb-3 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#58a6ff]" />
              Onboarding Stages
              {stages.length > 0 && <span className="ml-auto text-console-muted">{stages.length} stages</span>}
            </p>
            {previewLoading ? (
              <div className="flex items-center gap-2 py-2"><Loader2 className="w-3.5 h-3.5 animate-spin text-console-muted" /><span className="text-xs text-console-muted">Loading…</span></div>
            ) : stages.length > 0 ? (
              <div className="flex flex-wrap items-center gap-1.5">
                {stages.map((s, i) => (
                  <span key={s.stageKey} className="flex items-center gap-1.5">
                    <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs" style={{ borderColor: '#58a6ff44', background: '#58a6ff11', color: '#58a6ff' }}>
                      <span className="font-mono text-[10px] opacity-60">{i + 1}</span>
                      {s.stageLabel}
                      {!s.required && <span className="text-[10px] opacity-50">(opt)</span>}
                    </span>
                    {i < stages.length - 1 && <ChevronRight className="w-3 h-3 text-console-muted/40 shrink-0" />}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-console-muted/60 py-1">No onboarding stages configured</p>
            )}
          </div>
        )}

        {!complete && (
          <div className="bg-console-sidebar border border-console-border/50 rounded-lg p-4 text-center">
            <Zap className="w-8 h-8 text-console-muted/20 mx-auto mb-2" />
            <p className="text-xs text-console-muted/60">Complete all 6 selections to resolve the combined code</p>
          </div>
        )}
      </div>
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

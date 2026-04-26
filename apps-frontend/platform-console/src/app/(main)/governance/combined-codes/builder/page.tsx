'use client';

import { useState, useEffect, useCallback } from 'react';
import { Zap, ChevronRight, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

type Partner = { id: string; code: string; shortCode: string; name: string };
type Brand = { id: string; code: string; shortCode?: string; name: string };
type CrmEdition = { id: string; code: string; shortCode?: string; name: string };
type Vertical = { id: string; typeCode: string; typeName: string };
type SubType = { id: string; code: string; shortCode: string; name: string; userType: string };
type CombinedCode = { id: string; code: string; displayName: string; description?: string; isActive: boolean; modulesEnabled: unknown[] };

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

  const [result, setResult] = useState<CombinedCode | null | 'not-found'>(null);
  const [checking, setChecking] = useState(false);

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
    if (!vertical || !userType) { setSubTypes([]); setSubType(''); return; }
    api.pcConfig.subTypes(vertical, userType).then((data) => {
      setSubTypes(Array.isArray(data) ? data as SubType[] : []);
      setSubType('');
    }).catch(() => setSubTypes([]));
  }, [vertical, userType]);

  // Build preview code segments
  const partnerObj = partners.find((p) => p.code === partner);
  const brandObj = brands.find((b) => b.code === brand);
  const editionObj = editions.find((e) => e.code === edition);
  const verticalObj = verticals.find((v) => v.typeCode === vertical);
  const subTypeObj = subTypes.find((s) => s.code === subType);

  const complete = !!(partner && brand && edition && vertical && userType && subType);

  const assembledSegments = [
    { label: 'Partner', value: partnerObj?.shortCode, color: '#58a6ff' },
    { label: 'Brand', value: brandObj?.shortCode, color: '#d29922' },
    { label: 'CRM Edition', value: editionObj?.shortCode, color: '#3fb950' },
    { label: 'Vertical', value: verticalObj?.typeCode, color: '#bc8cff' },
    { label: 'User Type', value: userType || undefined, color: '#ff7b72' },
    { label: 'Sub-Type', value: subTypeObj?.shortCode, color: '#79c0ff' },
  ];

  const lookup = useCallback(async () => {
    if (!complete) return;
    // Try to find existing combined code by fetching the list filtered by brand
    setChecking(true);
    setResult(null);
    try {
      const codes = await api.pcConfig.combinedCodes(brand) as CombinedCode[];
      const found = Array.isArray(codes)
        ? codes.find((c) => c.code.includes(subTypeObj?.shortCode ?? '') && c.code.includes(userType))
        : null;
      setResult(found ?? 'not-found');
    } catch {
      setResult('not-found');
    } finally {
      setChecking(false);
    }
  }, [complete, brand, subTypeObj, userType]);

  const resetAfter = (field: 'partner' | 'brand' | 'edition' | 'vertical' | 'userType') => {
    setResult(null);
    if (field === 'edition' || field === 'brand') { setVertical(''); setSubType(''); setSubTypes([]); }
    if (field === 'vertical' || field === 'userType') { setSubType(''); }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-base font-semibold text-console-text flex items-center gap-2">
          <Zap className="w-4 h-4 text-console-accent" />
          Combined Code Builder
        </h2>
        <p className="text-xs text-console-muted mt-0.5">
          Select each cascade layer to preview the combined code and check if a record exists
        </p>
      </div>

      {/* Cascade selectors */}
      <div className="space-y-3">
        {/* Step 1: Partner */}
        <div className="bg-console-sidebar border border-console-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-5 h-5 rounded-full bg-[#58a6ff]/20 text-[#58a6ff] text-xs flex items-center justify-center font-bold">1</span>
            <span className="text-xs font-semibold text-console-text">Partner</span>
          </div>
          <select
            value={partner}
            onChange={(e) => { setPartner(e.target.value); resetAfter('partner'); }}
            className="w-full text-xs bg-[#0d1117] border border-console-border rounded-md px-2.5 py-2 text-console-text focus:outline-none focus:border-[#58a6ff]"
          >
            <option value="">Select partner…</option>
            {partners.map((p) => (
              <option key={p.code} value={p.code}>{p.name} ({p.shortCode})</option>
            ))}
          </select>
        </div>

        {/* Step 2: Brand */}
        <div className="bg-console-sidebar border border-console-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-5 h-5 rounded-full bg-[#d29922]/20 text-[#d29922] text-xs flex items-center justify-center font-bold">2</span>
            <span className="text-xs font-semibold text-console-text">Brand</span>
          </div>
          <select
            value={brand}
            onChange={(e) => { setBrand(e.target.value); resetAfter('brand'); }}
            className="w-full text-xs bg-[#0d1117] border border-console-border rounded-md px-2.5 py-2 text-console-text focus:outline-none focus:border-[#58a6ff]"
          >
            <option value="">Select brand…</option>
            {brands.map((b) => (
              <option key={b.code} value={b.code}>{b.name} ({b.shortCode ?? b.code})</option>
            ))}
          </select>
        </div>

        {/* Step 3: CRM Edition */}
        <div className="bg-console-sidebar border border-console-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-5 h-5 rounded-full bg-[#3fb950]/20 text-[#3fb950] text-xs flex items-center justify-center font-bold">3</span>
            <span className="text-xs font-semibold text-console-text">CRM Edition</span>
          </div>
          <select
            value={edition}
            onChange={(e) => { setEdition(e.target.value); resetAfter('edition'); }}
            className="w-full text-xs bg-[#0d1117] border border-console-border rounded-md px-2.5 py-2 text-console-text focus:outline-none focus:border-[#58a6ff]"
          >
            <option value="">Select edition…</option>
            {editions.map((e) => (
              <option key={e.code} value={e.code}>{e.name} ({e.shortCode ?? e.code})</option>
            ))}
          </select>
        </div>

        {/* Step 4: Vertical */}
        <div className={`bg-console-sidebar border border-console-border rounded-lg p-4 transition-opacity ${!edition ? 'opacity-40' : ''}`}>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-5 h-5 rounded-full bg-[#bc8cff]/20 text-[#bc8cff] text-xs flex items-center justify-center font-bold">4</span>
            <span className="text-xs font-semibold text-console-text">Vertical</span>
            {!edition && <span className="text-xs text-console-muted/60 ml-1">— select edition first</span>}
          </div>
          <select
            value={vertical}
            disabled={!edition}
            onChange={(e) => { setVertical(e.target.value); resetAfter('vertical'); }}
            className="w-full text-xs bg-[#0d1117] border border-console-border rounded-md px-2.5 py-2 text-console-text focus:outline-none focus:border-[#58a6ff] disabled:cursor-not-allowed"
          >
            <option value="">Select vertical…</option>
            {verticals.map((v) => (
              <option key={v.typeCode} value={v.typeCode}>{v.typeName}</option>
            ))}
          </select>
        </div>

        {/* Step 5: User Type */}
        <div className={`bg-console-sidebar border border-console-border rounded-lg p-4 transition-opacity ${!vertical ? 'opacity-40' : ''}`}>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-5 h-5 rounded-full bg-[#ff7b72]/20 text-[#ff7b72] text-xs flex items-center justify-center font-bold">5</span>
            <span className="text-xs font-semibold text-console-text">User Type</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {USER_TYPES.map((ut) => (
              <button
                key={ut.code}
                disabled={!vertical}
                onClick={() => { setUserType(ut.code); resetAfter('userType'); }}
                className={`px-3 py-2 text-xs rounded-md border transition-colors text-left disabled:cursor-not-allowed ${
                  userType === ut.code
                    ? 'border-[#ff7b72] bg-[#ff7b72]/10 text-[#ff7b72]'
                    : 'border-console-border text-console-muted hover:border-[#ff7b72]/50 hover:text-console-text'
                }`}
              >
                {ut.label}
              </button>
            ))}
          </div>
        </div>

        {/* Step 6: Sub-Type */}
        <div className={`bg-console-sidebar border border-console-border rounded-lg p-4 transition-opacity ${!userType ? 'opacity-40' : ''}`}>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-5 h-5 rounded-full bg-[#79c0ff]/20 text-[#79c0ff] text-xs flex items-center justify-center font-bold">6</span>
            <span className="text-xs font-semibold text-console-text">Sub-Type</span>
            {userType && vertical && subTypes.length === 0 && (
              <span className="text-xs text-console-muted/60 ml-1">— none available</span>
            )}
          </div>
          {subTypes.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {subTypes.map((s) => (
                <button
                  key={s.code}
                  onClick={() => { setSubType(s.code); setResult(null); }}
                  className={`px-3 py-2 text-xs rounded-md border transition-colors text-left ${
                    subType === s.code
                      ? 'border-[#79c0ff] bg-[#79c0ff]/10 text-[#79c0ff]'
                      : 'border-console-border text-console-muted hover:border-[#79c0ff]/50 hover:text-console-text'
                  }`}
                >
                  <span className="font-mono">{s.shortCode}</span>
                  <span className="ml-1.5 text-console-muted">{s.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <select
              value={subType}
              disabled={!userType}
              onChange={(e) => { setSubType(e.target.value); setResult(null); }}
              className="w-full text-xs bg-[#0d1117] border border-console-border rounded-md px-2.5 py-2 text-console-text focus:outline-none focus:border-[#58a6ff] disabled:cursor-not-allowed"
            >
              <option value="">Select sub-type…</option>
            </select>
          )}
        </div>
      </div>

      {/* Live preview */}
      <div className="bg-console-sidebar border border-console-border rounded-lg p-4">
        <p className="text-xs font-semibold text-console-text mb-3">Cascade Preview</p>
        <div className="flex flex-wrap items-center gap-1.5 mb-4">
          {assembledSegments.map((seg, i) => (
            <span key={seg.label} className="flex items-center gap-1.5">
              <span
                className="px-2 py-1 rounded text-xs font-mono"
                style={{
                  backgroundColor: seg.value ? seg.color + '22' : '#30363d',
                  color: seg.value ? seg.color : '#6e7681',
                  border: `1px solid ${seg.value ? seg.color + '44' : 'transparent'}`,
                }}
              >
                {seg.value ?? `[${seg.label}]`}
              </span>
              {i < assembledSegments.length - 1 && (
                <ChevronRight className="w-3 h-3 text-console-muted/40" />
              )}
            </span>
          ))}
        </div>

        {complete ? (
          <div className="space-y-3">
            <button
              onClick={lookup}
              disabled={checking}
              className="flex items-center gap-2 px-4 py-2 text-xs bg-console-accent text-white rounded-md hover:bg-console-accent/80 transition-colors disabled:opacity-60"
            >
              {checking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
              {checking ? 'Checking…' : 'Look up Combined Code'}
            </button>

            {result !== null && result !== 'not-found' && (
              <div className="bg-[#238636]/10 border border-[#238636]/30 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-[#3fb950]" />
                  <span className="text-xs font-semibold text-[#3fb950]">Combined code found</span>
                </div>
                <p className="font-mono text-sm text-console-text">{result.code}</p>
                <p className="text-xs text-console-muted mt-1">{result.displayName}</p>
                {result.description && (
                  <p className="text-xs text-console-muted/70 mt-1">{result.description}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-xs px-1.5 py-0.5 rounded ${result.isActive ? 'bg-[#238636]/20 text-[#3fb950]' : 'bg-[#30363d] text-console-muted'}`}>
                    {result.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-xs text-console-muted">
                    {Array.isArray(result.modulesEnabled) ? result.modulesEnabled.length : 0} modules
                  </span>
                </div>
              </div>
            )}

            {result === 'not-found' && (
              <div className="bg-[#30363d]/50 border border-console-border rounded-lg p-3 flex items-center gap-2">
                <XCircle className="w-4 h-4 text-console-muted" />
                <span className="text-xs text-console-muted">No combined code record found for this selection</span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-console-muted/60">Complete all 6 selections to look up the combined code</p>
        )}
      </div>
    </div>
  );
}

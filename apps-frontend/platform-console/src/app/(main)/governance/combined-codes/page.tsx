'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ListFilter, Zap, ChevronDown, ChevronRight, Plus, LayoutGrid } from 'lucide-react';
import { api } from '@/lib/api';

// ── Types ─────────────────────────────────────────────────────────────────────

type MasterConfig = {
  id: string; userTypeCode: string; subTypeCode?: string;
  resolvedCode: string; displayName: string; isActive: boolean;
  extraRegFields: unknown[];
};

type MasterCode = {
  id: string; masterCode: string;
  partnerCode: string; editionCode: string; brandCode: string; verticalCode: string;
  displayName: string; isActive: boolean;
  configCount?: number;
  configs?: MasterConfig[];
};

type Brand   = { id: string; code: string; name: string };
type Partner = { id: string; code: string; name: string };

const USER_TYPE_COLORS: Record<string, string> = {
  B2B: '#3fb950', B2C: '#58a6ff', IND_SP: '#d29922', IND_EE: '#bc8cff',
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function GovernanceCombinedCodesPage() {
  const router = useRouter();

  const [masters, setMasters]       = useState<MasterCode[]>([]);
  const [partners, setPartners]     = useState<Partner[]>([]);
  const [brands,   setBrands]       = useState<Brand[]>([]);
  const [loading,  setLoading]      = useState(true);

  const [partnerFilter, setPartnerFilter] = useState('');
  const [brandFilter,   setBrandFilter]   = useState('');
  const [verticalFilter, setVerticalFilter] = useState('');
  const [activeOnly,    setActiveOnly]    = useState(true);

  const [expandedIds,    setExpandedIds]    = useState<Set<string>>(new Set());
  const [loadingConfigs, setLoadingConfigs] = useState<Set<string>>(new Set());
  const [configsCache,   setConfigsCache]   = useState<Record<string, MasterConfig[]>>({});

  // ── Load data ───────────────────────────────────────────────────────────────

  const load = useCallback(async (partnerCode?: string, brandCode?: string) => {
    setLoading(true);
    try {
      const filters: { partnerCode?: string; brandCode?: string } = {};
      if (partnerCode) filters.partnerCode = partnerCode;
      if (brandCode)   filters.brandCode   = brandCode;
      const data = await api.pcConfig.masterCodes(filters) as MasterCode[];
      setMasters(Array.isArray(data) ? data : []);
    } catch {
      setMasters([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.all([
      api.pcConfig.partners() as Promise<Partner[]>,
      api.pcConfig.brands()   as Promise<Brand[]>,
    ]).then(([p, b]) => {
      setPartners(Array.isArray(p) ? p : []);
      setBrands(Array.isArray(b) ? b : []);
    }).catch(() => {});
    load();
  }, [load]);

  // ── Expand / collapse ────────────────────────────────────────────────────────

  const toggleExpand = async (master: MasterCode) => {
    const id = master.id;
    const isOpen = expandedIds.has(id);

    if (isOpen) {
      setExpandedIds((prev) => { const s = new Set(prev); s.delete(id); return s; });
      return;
    }

    setExpandedIds((prev) => new Set(prev).add(id));

    if (configsCache[id]) return;
    setLoadingConfigs((prev) => new Set(prev).add(id));
    try {
      const detail = await api.pcConfig.masterCode(id) as MasterCode & { configs: MasterConfig[] };
      setConfigsCache((prev) => ({ ...prev, [id]: detail.configs ?? [] }));
    } catch {
      setConfigsCache((prev) => ({ ...prev, [id]: [] }));
    } finally {
      setLoadingConfigs((prev) => { const s = new Set(prev); s.delete(id); return s; });
    }
  };

  // ── Filters ─────────────────────────────────────────────────────────────────

  const handleFilter = (pc: string, bc: string) => {
    setPartnerFilter(pc);
    setBrandFilter(bc);
    load(pc || undefined, bc || undefined);
  };

  const filtered = masters.filter((m) => {
    if (activeOnly && !m.isActive) return false;
    if (verticalFilter && m.verticalCode !== verticalFilter) return false;
    return true;
  });

  const uniqueVerticals = Array.from(new Set(masters.map((m) => m.verticalCode))).sort();
  const totalConfigs = filtered.reduce((sum, m) => sum + (m.configCount ?? 0), 0);

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-console-text flex items-center gap-2">
            <ListFilter className="w-4 h-4 text-[#ff7b72]" />
            Master Codes
          </h2>
          <p className="text-xs text-console-muted mt-0.5">
            {filtered.length} master codes · {totalConfigs} user type configurations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/governance/combined-codes/builder')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-console-accent text-white rounded-md hover:bg-console-accent/80 transition-colors"
          >
            <Zap className="w-3.5 h-3.5" /> Builder
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={partnerFilter}
          onChange={(e) => handleFilter(e.target.value, brandFilter)}
          className="text-xs bg-console-sidebar border border-console-border rounded-md px-2.5 py-1.5 text-console-text focus:outline-none focus:border-[#58a6ff]"
        >
          <option value="">All partners</option>
          {partners.map((p) => <option key={p.code} value={p.code}>{p.name}</option>)}
        </select>

        <select
          value={brandFilter}
          onChange={(e) => handleFilter(partnerFilter, e.target.value)}
          className="text-xs bg-console-sidebar border border-console-border rounded-md px-2.5 py-1.5 text-console-text focus:outline-none focus:border-[#58a6ff]"
        >
          <option value="">All brands</option>
          {brands.map((b) => <option key={b.code} value={b.code}>{b.name}</option>)}
        </select>

        <select
          value={verticalFilter}
          onChange={(e) => setVerticalFilter(e.target.value)}
          className="text-xs bg-console-sidebar border border-console-border rounded-md px-2.5 py-1.5 text-console-text focus:outline-none focus:border-[#58a6ff]"
        >
          <option value="">All verticals</option>
          {uniqueVerticals.map((v) => <option key={v} value={v}>{v}</option>)}
        </select>

        <label className="flex items-center gap-1.5 text-xs text-console-muted cursor-pointer select-none">
          <input type="checkbox" checked={activeOnly} onChange={(e) => setActiveOnly(e.target.checked)} className="rounded" />
          Active only
        </label>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 bg-console-sidebar border border-console-border rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-console-sidebar border border-console-border rounded-lg p-12 text-center">
          <LayoutGrid className="w-10 h-10 mx-auto mb-3 text-console-muted opacity-30" />
          <p className="text-sm text-console-muted">No master codes found</p>
          <p className="text-xs text-console-muted/60 mt-1">Use the Builder to create master codes</p>
          <button
            onClick={() => router.push('/governance/combined-codes/builder')}
            className="mt-4 flex items-center gap-1.5 px-4 py-2 text-xs bg-console-accent text-white rounded-md hover:bg-console-accent/80 transition-colors mx-auto"
          >
            <Plus className="w-3.5 h-3.5" /> Open Builder
          </button>
        </div>
      ) : (
        <div className="bg-console-sidebar border border-console-border rounded-lg overflow-hidden">
          {filtered.map((master, mIdx) => {
            const isOpen = expandedIds.has(master.id);
            const isLoadingConfigs = loadingConfigs.has(master.id);
            const configs = configsCache[master.id] ?? [];

            return (
              <div key={master.id} className={mIdx < filtered.length - 1 || isOpen ? 'border-b border-console-border' : ''}>
                {/* Master row */}
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/[0.02] transition-colors group"
                  onClick={() => toggleExpand(master)}
                >
                  {isOpen
                    ? <ChevronDown className="w-3.5 h-3.5 text-console-muted shrink-0" />
                    : <ChevronRight className="w-3.5 h-3.5 text-console-muted shrink-0" />
                  }
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-console-accent font-semibold truncate">{master.masterCode}</span>
                      {!master.isActive && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#30363d] text-console-muted shrink-0">Inactive</span>
                      )}
                    </div>
                    <p className="text-[10px] text-console-muted truncate mt-0.5">{master.displayName}</p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="flex gap-1.5 text-[10px] text-console-muted/60">
                      <span className="font-mono">{master.partnerCode}</span>
                      <span>·</span>
                      <span className="font-mono">{master.editionCode}</span>
                      <span>·</span>
                      <span className="font-mono">{master.brandCode}</span>
                      <span>·</span>
                      <span className="font-mono">{master.verticalCode}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#30363d] text-console-muted">
                      {isLoadingConfigs ? '…' : (master.configCount ?? configs.length)} configs
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); router.push(`/governance/combined-codes/builder?masterId=${master.id}`); }}
                      className="text-[10px] text-console-muted/50 hover:text-[#58a6ff] border border-console-border/50 hover:border-[#58a6ff]/40 rounded px-2 py-0.5 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      Edit
                    </button>
                  </div>
                </div>

                {/* Expanded child configs */}
                {isOpen && (
                  <div className="border-t border-console-border/40">
                    {isLoadingConfigs ? (
                      <div className="px-10 py-3 text-xs text-console-muted/50 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-console-muted/30 animate-pulse" />
                        Loading configs…
                      </div>
                    ) : configs.length === 0 ? (
                      <div className="px-10 py-3 text-xs text-console-muted/50">
                        No user type configs yet —{' '}
                        <button
                          className="text-console-accent hover:underline"
                          onClick={() => router.push(`/governance/combined-codes/builder?masterId=${master.id}`)}
                        >
                          add in Builder
                        </button>
                      </div>
                    ) : (
                      configs.map((cfg, cIdx) => (
                        <div
                          key={cfg.id}
                          className={`flex items-center gap-3 px-10 py-2.5 cursor-pointer hover:bg-white/[0.02] transition-colors ${cIdx < configs.length - 1 ? 'border-b border-console-border/20' : ''}`}
                          onClick={() => router.push(`/governance/combined-codes/builder?masterId=${master.id}`)}
                        >
                          <span className="text-console-muted/30 font-mono text-[10px] shrink-0">├</span>
                          <span
                            className="font-mono text-[10px] px-1.5 py-0.5 rounded shrink-0"
                            style={{ background: (USER_TYPE_COLORS[cfg.userTypeCode] ?? '#6e7681') + '22', color: USER_TYPE_COLORS[cfg.userTypeCode] ?? '#6e7681', border: `1px solid ${(USER_TYPE_COLORS[cfg.userTypeCode] ?? '#6e7681')}44` }}
                          >
                            {cfg.userTypeCode}
                          </span>
                          <span className="font-mono text-xs text-console-accent flex-1 truncate">{cfg.resolvedCode}</span>
                          <span className="text-xs text-console-text truncate max-w-[180px]">{cfg.displayName}</span>
                          {cfg.subTypeCode && (
                            <span className="text-[10px] font-mono text-console-muted/60 shrink-0">{cfg.subTypeCode}</span>
                          )}
                          <span className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 ${cfg.isActive ? 'bg-[#238636]/20 text-[#3fb950]' : 'bg-[#30363d] text-console-muted'}`}>
                            {cfg.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Legacy combined codes link */}
      <p className="text-[10px] text-console-muted/40">
        Looking for old flat codes?{' '}
        <a href="/governance/combined-codes/legacy" className="text-console-muted/60 hover:text-console-muted underline">
          View legacy combined codes
        </a>
      </p>
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, LayoutDashboard, Package, List,
  Sparkles, GitBranch, Settings, Layers,
} from 'lucide-react';
import { api } from '@/lib/api';
import { TabNav, Tab } from '@/components/vertical-config/TabNav';
import { ModuleCard } from '@/components/vertical-config/ModuleCard';

type Vertical = {
  id: string;
  verticalCode: string;
  verticalName: string;
  displayName: string;
  description?: string;
  colorTheme?: string;
  folderPath: string;
  packageName: string;
  databaseSchemas: string[];
  apiPrefix: string;
  isActive: boolean;
  isBeta: boolean;
  isComingSoon: boolean;
  basePrice?: number;
  perUserPrice?: number;
  currency?: string;
  defaultSettings?: Record<string, unknown>;
  modules: any[];
  menus: any[];
  features: any[];
};

export default function VerticalDetailPage() {
  const { code } = useParams<{ code: string }>();
  const [vertical, setVertical] = useState<Vertical | null>(null);
  const [menuTree, setMenuTree] = useState<any[]>([]);
  const [featuresGrouped, setFeaturesGrouped] = useState<Record<string, any[]>>({});
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!code) return;
    setLoading(true);
    try {
      const [v, menus, features] = await Promise.all([
        api.verticalConfig.get(code) as Promise<Vertical>,
        api.verticalConfig.menuTree(code) as Promise<any[]>,
        api.verticalConfig.features(code) as Promise<Record<string, any[]>>,
      ]);
      setVertical(v);
      setMenuTree(Array.isArray(menus) ? menus : []);
      setFeaturesGrouped(features && typeof features === 'object' ? features as Record<string, any[]> : {});
    } catch {
      setVertical(null);
    } finally {
      setLoading(false);
    }
  }, [code]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-32 bg-[#161b22] rounded" />
        <div className="h-28 bg-[#161b22] border border-[#30363d] rounded-lg" />
        <div className="h-64 bg-[#161b22] border border-[#30363d] rounded-lg" />
      </div>
    );
  }

  if (!vertical) {
    return (
      <div className="text-center py-16">
        <Layers className="w-8 h-8 text-[#8b949e] mx-auto mb-3" />
        <p className="text-[#8b949e]">Vertical not found: {code}</p>
        <Link href="/vertical-config" className="mt-4 inline-block text-[#58a6ff] text-sm hover:underline">
          ← All Verticals
        </Link>
      </div>
    );
  }

  const tabs: Tab[] = [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'modules', label: 'Modules', icon: Package, count: vertical.modules?.length },
    { key: 'menus', label: 'Menus', icon: List, count: vertical.menus?.length },
    { key: 'features', label: 'Features', icon: Sparkles, count: vertical.features?.length },
    { key: 'dependencies', label: 'Dependencies', icon: GitBranch },
    { key: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="space-y-5">
      <Link href="/vertical-config" className="inline-flex items-center gap-1.5 text-xs text-[#8b949e] hover:text-[#c9d1d9]">
        <ArrowLeft className="w-3.5 h-3.5" /> All Verticals
      </Link>

      {/* Header card */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 flex items-start gap-4">
        <div
          className="w-14 h-14 rounded-lg flex items-center justify-center text-white font-bold text-xl flex-shrink-0"
          style={{ backgroundColor: vertical.colorTheme ?? '#238636' }}
        >
          {vertical.displayName[0]}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold text-[#c9d1d9]">{vertical.verticalName}</h2>
          <p className="text-xs font-mono text-[#8b949e]">{vertical.verticalCode}</p>
          {vertical.description && (
            <p className="text-xs text-[#8b949e] mt-1.5 line-clamp-2">{vertical.description}</p>
          )}
          <div className="flex gap-1.5 mt-2">
            {vertical.isActive && (
              <span className="bg-green-900/40 text-green-400 border border-green-800 text-xs px-2 py-0.5 rounded">Active</span>
            )}
            {vertical.isComingSoon && (
              <span className="bg-[#21262d] text-[#8b949e] border border-[#30363d] text-xs px-2 py-0.5 rounded">Coming Soon</span>
            )}
            {vertical.isBeta && (
              <span className="bg-yellow-900/40 text-yellow-400 border border-yellow-800 text-xs px-2 py-0.5 rounded">Beta</span>
            )}
          </div>
        </div>
        {vertical.basePrice && (
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-[#8b949e]">Base</p>
            <p className="text-sm font-bold text-green-400">₹{vertical.basePrice}/mo</p>
            <p className="text-xs text-[#8b949e]">+₹{vertical.perUserPrice}/user</p>
          </div>
        )}
      </div>

      <TabNav tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'overview' && <OverviewTab vertical={vertical} />}
      {activeTab === 'modules' && <ModulesTab vertical={vertical} code={code} />}
      {activeTab === 'menus' && <MenusTab menuTree={menuTree} total={vertical.menus?.length ?? 0} />}
      {activeTab === 'features' && <FeaturesTab grouped={featuresGrouped} total={vertical.features?.length ?? 0} />}
      {activeTab === 'dependencies' && <DependenciesTab modules={vertical.modules ?? []} />}
      {activeTab === 'settings' && <SettingsTab vertical={vertical} />}
    </div>
  );
}

function OverviewTab({ vertical }: { vertical: Vertical }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
        <h3 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wide mb-3">Technical</h3>
        <dl className="space-y-2 text-xs">
          {[
            ['Folder', vertical.folderPath],
            ['Package', vertical.packageName],
            ['API Prefix', vertical.apiPrefix],
            ['Databases', (vertical.databaseSchemas ?? []).join(', ')],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-2">
              <dt className="text-[#8b949e]">{k}:</dt>
              <dd className="font-mono text-[#c9d1d9] text-right truncate">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
        <h3 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wide mb-3">Pricing</h3>
        <dl className="space-y-2 text-xs">
          <div className="flex justify-between">
            <dt className="text-[#8b949e]">Base Price:</dt>
            <dd className="text-green-400 font-bold">{vertical.basePrice ? `₹${vertical.basePrice}/mo` : '—'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[#8b949e]">Per User:</dt>
            <dd className="text-green-400">{vertical.perUserPrice ? `₹${vertical.perUserPrice}/user` : '—'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[#8b949e]">Currency:</dt>
            <dd className="text-[#c9d1d9]">{vertical.currency ?? 'INR'}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

function ModulesTab({ vertical, code }: { vertical: Vertical; code: string }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {(vertical.modules ?? []).map(m => (
        <ModuleCard key={m.id} module={m} verticalCode={code} />
      ))}
    </div>
  );
}

function MenusTab({ menuTree, total }: { menuTree: any[]; total: number }) {
  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
      <h3 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wide mb-3">
        Menu Tree — {total} total
      </h3>
      {menuTree.length === 0 ? (
        <p className="text-sm text-[#8b949e] py-4 text-center">No menus (all are flat, no parent-child)</p>
      ) : null}
      <div className="space-y-0.5">
        {menuTree.map(m => <MenuNode key={m.id} menu={m} level={0} />)}
      </div>
      {/* Flat list fallback if tree is empty but there are menus (flat structure) */}
    </div>
  );
}

function MenuNode({ menu, level }: { menu: any; level: number }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = (menu.children?.length ?? 0) > 0;

  return (
    <div>
      <div
        className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[#21262d] cursor-pointer group"
        style={{ paddingLeft: `${level * 18 + 8}px` }}
        onClick={() => hasChildren && setExpanded(e => !e)}
      >
        <span className="text-[#484f58] w-3 text-xs">
          {hasChildren ? (expanded ? '▼' : '▶') : '•'}
        </span>
        <span className="text-sm text-[#c9d1d9]">{menu.menuLabel}</span>
        <span className="text-xs font-mono text-[#484f58]">({menu.menuCode})</span>
        {menu.route && (
          <span className="text-xs text-[#58a6ff] ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
            {menu.route}
          </span>
        )}
        {menu.module?.moduleCode && (
          <span className="text-xs bg-[#238636]/20 text-green-400 border border-[#238636]/30 px-1.5 py-0.5 rounded">
            {menu.module.moduleCode}
          </span>
        )}
      </div>
      {expanded && hasChildren && (
        <div>
          {menu.children.map((c: any) => <MenuNode key={c.id} menu={c} level={level + 1} />)}
        </div>
      )}
    </div>
  );
}

function FeaturesTab({ grouped, total }: { grouped: Record<string, any[]>; total: number }) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-[#8b949e]">{total} features across {Object.keys(grouped).length} modules</p>
      {Object.entries(grouped).map(([moduleCode, feats]) => (
        <div key={moduleCode} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
          <h3 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wide mb-3 flex items-center gap-2">
            <Package className="w-3.5 h-3.5" />
            {moduleCode === '_cross_cutting' ? 'Cross-cutting' : moduleCode}
            <span className="font-normal normal-case">({feats.length})</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {feats.map(f => (
              <div key={f.id} className="bg-[#0d1117] rounded-md p-3 border border-[#21262d]">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-[#c9d1d9] truncate">{f.featureName}</p>
                    <p className="text-xs font-mono text-[#484f58] mt-0.5 truncate">{f.featureCode}</p>
                  </div>
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${f.isDefaultEnabled ? 'bg-green-500' : 'bg-[#484f58]'}`}
                  />
                </div>
                <div className="flex gap-1 mt-2 flex-wrap">
                  {f.category === 'core' && (
                    <span className="bg-[#58a6ff]/10 text-[#58a6ff] text-xs px-1.5 py-0.5 rounded">Core</span>
                  )}
                  {f.category === 'premium' && (
                    <span className="bg-purple-900/30 text-purple-400 text-xs px-1.5 py-0.5 rounded">Premium</span>
                  )}
                  {f.isBeta && (
                    <span className="bg-yellow-900/30 text-yellow-400 text-xs px-1.5 py-0.5 rounded">Beta</span>
                  )}
                  {f.isExperimental && (
                    <span className="bg-orange-900/30 text-orange-400 text-xs px-1.5 py-0.5 rounded">Experimental</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function DependenciesTab({ modules }: { modules: any[] }) {
  const withDeps = modules.filter(m => (m.dependsOn as string[] | null)?.length);
  const standalone = modules.filter(m => !(m.dependsOn as string[] | null)?.length);
  return (
    <div className="space-y-4">
      {withDeps.length > 0 && (
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
          <h3 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wide mb-3">With Dependencies</h3>
          <div className="space-y-2">
            {withDeps.map(m => (
              <div key={m.id} className="flex items-center gap-3 text-xs bg-[#0d1117] rounded p-3 border border-[#21262d]">
                <span className="font-mono font-semibold text-[#c9d1d9] w-32 flex-shrink-0">{m.moduleCode}</span>
                <span className="text-[#484f58]">→ depends on →</span>
                <div className="flex gap-1 flex-wrap">
                  {(m.dependsOn as string[]).map((d: string) => (
                    <span key={d} className="bg-[#238636]/20 text-green-400 border border-[#238636]/30 px-2 py-0.5 rounded font-mono">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
        <h3 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wide mb-3">
          Standalone ({standalone.length})
        </h3>
        <div className="flex flex-wrap gap-2">
          {standalone.map(m => (
            <span key={m.id} className="bg-[#21262d] text-[#8b949e] text-xs font-mono px-2 py-1 rounded border border-[#30363d]">
              {m.moduleCode}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function SettingsTab({ vertical }: { vertical: Vertical }) {
  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
      <h3 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wide mb-3">Default Settings</h3>
      <pre className="bg-[#0d1117] border border-[#21262d] p-4 rounded text-xs text-[#c9d1d9] overflow-auto font-mono">
        {JSON.stringify(vertical.defaultSettings ?? {}, null, 2)}
      </pre>
      <p className="text-xs text-[#484f58] mt-2">
        Applied to new tenants created on this vertical. Overridable per brand in WAR #12.
      </p>
    </div>
  );
}

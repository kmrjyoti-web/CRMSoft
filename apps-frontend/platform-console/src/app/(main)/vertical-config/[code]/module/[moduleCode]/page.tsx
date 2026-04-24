'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Package, List, Sparkles, Settings,
  Shield, Crown, CheckCircle, XCircle,
} from 'lucide-react';
import { api } from '@/lib/api';
import { TabNav, Tab } from '@/components/vertical-config/TabNav';

type Module = {
  id: string;
  moduleCode: string;
  moduleName: string;
  displayName: string;
  description?: string;
  colorTheme?: string;
  isRequired: boolean;
  isPremium: boolean;
  isDefaultEnabled: boolean;
  packagePath?: string;
  apiNamespace?: string;
  dbTables?: string[];
  dependsOn?: string[];
  conflictsWith?: string[];
  addonPrice?: number;
};

export default function ModuleDetailPage() {
  const { code, moduleCode } = useParams<{ code: string; moduleCode: string }>();
  const [vertical, setVertical] = useState<any>(null);
  const [module, setModule] = useState<Module | null>(null);
  const [moduleMenus, setModuleMenus] = useState<any[]>([]);
  const [moduleFeatures, setModuleFeatures] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!code) return;
    setLoading(true);
    try {
      const v = (await api.verticalConfig.get(code)) as any;
      setVertical(v);
      const mod = v?.modules?.find((m: any) => m.moduleCode === moduleCode) ?? null;
      setModule(mod);
      if (mod) {
        setModuleMenus((v.menus ?? []).filter((m: any) => m.moduleId === mod.id));
        setModuleFeatures((v.features ?? []).filter((f: any) => f.moduleId === mod.id));
      }
    } catch {
      setVertical(null);
    } finally {
      setLoading(false);
    }
  }, [code, moduleCode]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return <div className="animate-pulse space-y-4"><div className="h-28 bg-[#161b22] border border-[#30363d] rounded-lg" /></div>;
  }

  if (!vertical || !module) {
    return (
      <div className="text-center py-16">
        <Package className="w-8 h-8 text-[#8b949e] mx-auto mb-3" />
        <p className="text-[#8b949e]">Module not found: {moduleCode}</p>
        <Link href={`/vertical-config/${code}`} className="mt-4 inline-block text-[#58a6ff] text-sm hover:underline">
          ← Back to {code}
        </Link>
      </div>
    );
  }

  const tabs: Tab[] = [
    { key: 'overview', label: 'Overview', icon: Package },
    { key: 'menus', label: 'Menus', icon: List, count: moduleMenus.length },
    { key: 'features', label: 'Features', icon: Sparkles, count: moduleFeatures.length },
    { key: 'config', label: 'Config', icon: Settings },
  ];

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-[#8b949e]">
        <Link href="/vertical-config" className="hover:text-[#c9d1d9]">Verticals</Link>
        <span>›</span>
        <Link href={`/vertical-config/${code}`} className="hover:text-[#c9d1d9]">{vertical.verticalName}</Link>
        <span>›</span>
        <span className="text-[#c9d1d9]">{module.moduleName}</span>
      </div>

      <Link href={`/vertical-config/${code}`} className="inline-flex items-center gap-1.5 text-xs text-[#8b949e] hover:text-[#c9d1d9]">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to {vertical.verticalName}
      </Link>

      {/* Module header */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 flex items-start gap-4">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
          style={{ backgroundColor: module.colorTheme ?? '#238636' }}
        >
          {module.displayName[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-[#c9d1d9]">{module.moduleName}</h2>
            {module.isRequired && <Shield className="w-4 h-4 text-yellow-500 flex-shrink-0" aria-label="Required module" />}
            {module.isPremium && <Crown className="w-4 h-4 text-purple-400 flex-shrink-0" aria-label="Premium module" />}
          </div>
          <p className="text-xs font-mono text-[#8b949e] mt-0.5">{module.moduleCode}</p>
          {module.description && (
            <p className="text-xs text-[#8b949e] mt-1.5">{module.description}</p>
          )}
        </div>
        <div className="text-right flex-shrink-0">
          {module.isDefaultEnabled ? (
            <div className="flex items-center gap-1 text-xs text-green-400">
              <CheckCircle className="w-3.5 h-3.5" /> Default on
            </div>
          ) : (
            <div className="flex items-center gap-1 text-xs text-[#8b949e]">
              <XCircle className="w-3.5 h-3.5" /> Opt-in
            </div>
          )}
          {module.addonPrice && (
            <p className="text-xs text-green-400 mt-1">+₹{module.addonPrice}/mo</p>
          )}
        </div>
      </div>

      <TabNav tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
            <h3 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wide mb-3">Technical</h3>
            <dl className="space-y-2 text-xs">
              {[
                ['Package Path', module.packagePath ?? '—'],
                ['API Namespace', module.apiNamespace ?? '—'],
                ['DB Tables', `${module.dbTables?.length ?? 0} tables`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-2">
                  <dt className="text-[#8b949e]">{k}:</dt>
                  <dd className="font-mono text-[#c9d1d9]">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
            <h3 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wide mb-3">Dependencies</h3>
            {(module.dependsOn?.length ?? 0) > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {module.dependsOn!.map(d => (
                  <span key={d} className="bg-[#238636]/20 text-green-400 border border-[#238636]/30 text-xs font-mono px-2 py-0.5 rounded">
                    {d}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#484f58]">No dependencies — standalone module</p>
            )}
          </div>
          {(module.dbTables?.length ?? 0) > 0 && (
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 md:col-span-2">
              <h3 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wide mb-3">Database Tables</h3>
              <div className="flex flex-wrap gap-1.5">
                {module.dbTables!.map(t => (
                  <span key={t} className="bg-[#21262d] text-[#c9d1d9] text-xs font-mono px-2 py-1 rounded border border-[#30363d]">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'menus' && (
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-[#0d1117] border-b border-[#30363d]">
              <tr>
                {['Label', 'Code', 'Route', 'Sort'].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-[#8b949e] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#21262d]">
              {moduleMenus.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-[#8b949e]">No menus for this module</td>
                </tr>
              ) : moduleMenus.map(m => (
                <tr key={m.id} className="hover:bg-[#21262d]">
                  <td className="px-4 py-2.5 font-medium text-[#c9d1d9]">{m.menuLabel}</td>
                  <td className="px-4 py-2.5 font-mono text-[#8b949e]">{m.menuCode}</td>
                  <td className="px-4 py-2.5 text-[#58a6ff] font-mono">{m.route ?? '—'}</td>
                  <td className="px-4 py-2.5 text-[#484f58]">{m.sortOrder}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'features' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {moduleFeatures.length === 0 ? (
            <div className="md:col-span-2 text-center py-8 text-[#8b949e] bg-[#161b22] border border-[#30363d] rounded-lg">
              No features assigned to this module
            </div>
          ) : moduleFeatures.map(f => (
            <div key={f.id} className="bg-[#161b22] border border-[#30363d] rounded-lg p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#c9d1d9]">{f.featureName}</p>
                  <p className="text-xs font-mono text-[#484f58] mt-0.5">{f.featureCode}</p>
                </div>
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${f.isDefaultEnabled ? 'bg-green-500' : 'bg-[#484f58]'}`} />
              </div>
              <div className="flex gap-1 mt-2 flex-wrap">
                {f.category === 'core' && <span className="bg-[#58a6ff]/10 text-[#58a6ff] text-xs px-1.5 py-0.5 rounded">Core</span>}
                {f.category === 'premium' && <span className="bg-purple-900/30 text-purple-400 text-xs px-1.5 py-0.5 rounded">Premium</span>}
                {f.isBeta && <span className="bg-yellow-900/30 text-yellow-400 text-xs px-1.5 py-0.5 rounded">Beta</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'config' && (
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
          <h3 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wide mb-3">Module Snapshot</h3>
          <pre className="bg-[#0d1117] border border-[#21262d] p-4 rounded text-xs text-[#c9d1d9] overflow-auto font-mono">
            {JSON.stringify({
              moduleCode: module.moduleCode,
              isDefaultEnabled: module.isDefaultEnabled,
              isRequired: module.isRequired,
              isPremium: module.isPremium,
              dependsOn: module.dependsOn ?? [],
              dbTables: module.dbTables ?? [],
              apiNamespace: module.apiNamespace,
              packagePath: module.packagePath,
            }, null, 2)}
          </pre>
          <p className="text-xs text-[#484f58] mt-2">
            Brand-level overrides (enable/disable per brand) coming in WAR #12.
          </p>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';

type BrandDetail = {
  brandId: string;
  name?: string;
  modulesCount: number;
  featuresCount: number;
  totalErrors: number;
  criticalCount: number;
};

type WhitelistedModule = {
  id: string;
  moduleCode: string;
  status: string;
  enabledAt: string;
  trialExpiresAt?: string;
};

type BrandFeature = {
  id: string;
  featureCode: string;
  isEnabled: boolean;
  config?: Record<string, unknown>;
};

type BrandError = {
  period: string;
  totalErrors: number;
  criticalCount: number;
  resolvedCount: number;
  topModules: string[];
};

const FEATURE_CODES = [
  'MARKETPLACE', 'AI_WORKFLOWS', 'WHATSAPP_CHAT', 'CUSTOM_DOMAIN',
  'MULTI_LANGUAGE', 'REPORTS_DESIGNER', 'WORKFLOW_BUILDER', 'PUJA_MODE',
  'BULK_IMPORT', 'API_ACCESS', 'WEBHOOK_INTEGRATIONS', 'ADVANCED_ANALYTICS',
];

const MODULE_STATUS_STYLES: Record<string, string> = {
  ENABLED: 'bg-[#238636]/20 text-[#3fb950]',
  DISABLED: 'bg-[#30363d] text-[#8b949e]',
  TRIAL: 'bg-[#d29922]/20 text-[#d29922]',
};

export default function BrandDetailPage() {
  const params = useParams();
  const brandId = params.brandId as string;

  const [brand, setBrand] = useState<BrandDetail | null>(null);
  const [modules, setModules] = useState<WhitelistedModule[]>([]);
  const [features, setFeatures] = useState<BrandFeature[]>([]);
  const [errors, setErrors] = useState<BrandError[]>([]);
  const [activeTab, setActiveTab] = useState<'modules' | 'features' | 'errors'>('modules');
  const [loading, setLoading] = useState(true);

  // Add module form state
  const [showAddModule, setShowAddModule] = useState(false);
  const [newModuleCode, setNewModuleCode] = useState('');
  const [newModuleStatus, setNewModuleStatus] = useState('ENABLED');
  const [newModuleTrialExpiry, setNewModuleTrialExpiry] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Feature config editing
  const [editingConfig, setEditingConfig] = useState<string | null>(null);
  const [configValue, setConfigValue] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [brandData, modulesData, featuresData, errorsData] = await Promise.all([
        api.brands.get(brandId) as Promise<BrandDetail>,
        api.brands.modules(brandId) as Promise<WhitelistedModule[] | { items: WhitelistedModule[] }>,
        api.brands.features(brandId) as Promise<BrandFeature[] | { items: BrandFeature[] }>,
        api.brands.errors(brandId) as Promise<BrandError[] | { items: BrandError[] }>,
      ]);
      setBrand(brandData);
      setModules(Array.isArray(modulesData) ? modulesData : (modulesData as any).items ?? []);
      setFeatures(Array.isArray(featuresData) ? featuresData : (featuresData as any).items ?? []);
      setErrors(Array.isArray(errorsData) ? errorsData : (errorsData as any).items ?? []);
    } catch {
      setBrand(null);
    } finally {
      setLoading(false);
    }
  }, [brandId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddModule = async () => {
    if (!newModuleCode.trim()) return;
    setSubmitting(true);
    try {
      await api.brands.whitelistModule(brandId, {
        moduleCode: newModuleCode.trim(),
        status: newModuleStatus,
        ...(newModuleStatus === 'TRIAL' && newModuleTrialExpiry ? { trialExpiresAt: newModuleTrialExpiry } : {}),
      });
      setShowAddModule(false);
      setNewModuleCode('');
      setNewModuleStatus('ENABLED');
      setNewModuleTrialExpiry('');
      fetchData();
    } catch {
      // error handled silently
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleModuleStatus = async (mod: WhitelistedModule) => {
    const newStatus = mod.status === 'ENABLED' ? 'DISABLED' : 'ENABLED';
    try {
      await api.brands.updateModule(brandId, mod.id, { status: newStatus });
      fetchData();
    } catch {
      // error handled silently
    }
  };

  const handleRemoveModule = async (mod: WhitelistedModule) => {
    if (!confirm(`Remove module ${mod.moduleCode}?`)) return;
    try {
      await api.brands.removeModule(brandId, mod.id);
      fetchData();
    } catch {
      // error handled silently
    }
  };

  const handleToggleFeature = async (featureCode: string, currentlyEnabled: boolean, existingFeature?: BrandFeature) => {
    try {
      if (existingFeature) {
        await api.brands.updateFeature(brandId, existingFeature.id, { isEnabled: !currentlyEnabled });
      } else {
        await api.brands.setFeature(brandId, { featureCode, isEnabled: !currentlyEnabled });
      }
      fetchData();
    } catch {
      // error handled silently
    }
  };

  const handleSaveConfig = async (feature: BrandFeature) => {
    try {
      const parsed = JSON.parse(configValue);
      await api.brands.updateFeature(brandId, feature.id, { config: parsed });
      setEditingConfig(null);
      setConfigValue('');
      fetchData();
    } catch {
      // invalid JSON or API error
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-20 bg-[#161b22] border border-[#30363d] rounded-lg animate-pulse" />
        <div className="h-64 bg-[#161b22] border border-[#30363d] rounded-lg animate-pulse" />
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-8 text-center">
        <p className="text-sm text-[#8b949e]">Brand not found</p>
        <Link href="/brands" className="text-xs text-[#58a6ff] hover:underline mt-2 inline-block">
          Back to brands
        </Link>
      </div>
    );
  }

  const featureMap = new Map(features.map((f) => [f.featureCode, f]));

  const TABS = [
    { key: 'modules' as const, label: 'Modules', count: modules.length },
    { key: 'features' as const, label: 'Features', count: features.filter((f) => f.isEnabled).length },
    { key: 'errors' as const, label: 'Errors', count: errors.length },
  ];

  return (
    <div className="space-y-6">
      {/* Back + Brand Header */}
      <div>
        <Link href="/brands" className="flex items-center gap-1 text-xs text-[#58a6ff] hover:underline mb-3">
          <ArrowLeft className="w-3 h-3" /> Back to brands
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#c9d1d9]">{brand.brandId}</h2>
            {brand.name && <p className="text-xs text-[#8b949e] mt-0.5">{brand.name}</p>}
          </div>
          <div className="flex items-center gap-3 text-xs text-[#8b949e]">
            <span>{brand.modulesCount} modules</span>
            <span>{brand.featuresCount} features</span>
            <span>{brand.totalErrors} errors</span>
            <Link
              href={`/menus/brands/${brandId}`}
              className="px-3 py-1.5 bg-[#21262d] text-[#c9d1d9] border border-[#30363d] rounded-md hover:bg-[#30363d] transition-colors"
            >
              Menu Overrides
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0 border-b border-[#30363d]">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-[#58a6ff] text-[#c9d1d9]'
                : 'border-transparent text-[#8b949e] hover:text-[#c9d1d9]'
            }`}
          >
            {tab.label}
            <span className="ml-1.5 text-xs bg-white/5 px-1.5 py-0.5 rounded">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Tab: Modules */}
      {activeTab === 'modules' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#c9d1d9]">Whitelisted Modules</h3>
            <button
              onClick={() => setShowAddModule(!showAddModule)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#238636] text-white rounded-md hover:bg-[#2ea043] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Module
            </button>
          </div>

          {/* Add module inline form */}
          {showAddModule && (
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 flex flex-wrap items-end gap-3">
              <div>
                <label className="block text-xs text-[#8b949e] mb-1">Module Code</label>
                <input
                  type="text"
                  value={newModuleCode}
                  onChange={(e) => setNewModuleCode(e.target.value)}
                  placeholder="e.g. LEADS"
                  className="bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] rounded-md px-3 py-2 text-sm focus:border-[#58a6ff] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-[#8b949e] mb-1">Status</label>
                <select
                  value={newModuleStatus}
                  onChange={(e) => setNewModuleStatus(e.target.value)}
                  className="bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] rounded-md px-3 py-2 text-sm focus:border-[#58a6ff] focus:outline-none"
                >
                  <option value="ENABLED">Enabled</option>
                  <option value="TRIAL">Trial</option>
                </select>
              </div>
              {newModuleStatus === 'TRIAL' && (
                <div>
                  <label className="block text-xs text-[#8b949e] mb-1">Trial Expires</label>
                  <input
                    type="date"
                    value={newModuleTrialExpiry}
                    onChange={(e) => setNewModuleTrialExpiry(e.target.value)}
                    className="bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] rounded-md px-3 py-2 text-sm focus:border-[#58a6ff] focus:outline-none"
                  />
                </div>
              )}
              <button
                onClick={handleAddModule}
                disabled={submitting || !newModuleCode.trim()}
                className="px-3 py-2 text-xs bg-[#238636] text-white rounded-md hover:bg-[#2ea043] disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Adding...' : 'Add'}
              </button>
              <button
                onClick={() => setShowAddModule(false)}
                className="px-3 py-2 text-xs bg-[#21262d] text-[#c9d1d9] border border-[#30363d] rounded-md hover:bg-[#30363d] transition-colors"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Modules table */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#30363d]">
                  <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Module Code</th>
                  <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Enabled At</th>
                  <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Trial Expires</th>
                  <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {modules.length > 0 ? (
                  modules.map((m) => (
                    <tr key={m.id} className="border-b border-[#30363d]/50 hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 text-[#c9d1d9] font-mono font-medium">{m.moduleCode}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${MODULE_STATUS_STYLES[m.status] ?? MODULE_STATUS_STYLES.DISABLED}`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#8b949e] text-xs">
                        {m.enabledAt ? new Date(m.enabledAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : '—'}
                      </td>
                      <td className="px-4 py-3 text-[#8b949e] text-xs">
                        {m.trialExpiresAt ? new Date(m.trialExpiresAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' }) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleModuleStatus(m)}
                            className="text-xs text-[#58a6ff] hover:underline"
                          >
                            {m.status === 'ENABLED' ? 'Disable' : 'Enable'}
                          </button>
                          <button
                            onClick={() => handleRemoveModule(m)}
                            className="text-xs text-red-400 hover:underline"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-[#8b949e]">
                      No modules whitelisted yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Features */}
      {activeTab === 'features' && (
        <div className="space-y-2">
          {FEATURE_CODES.map((code) => {
            const existing = featureMap.get(code);
            const isEnabled = existing?.isEnabled ?? false;
            const isEditingConfig = editingConfig === code;

            return (
              <div
                key={code}
                className="bg-[#161b22] border border-[#30363d] rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#c9d1d9]">{code}</p>
                    {existing?.id && (
                      <p className="text-xs text-[#8b949e] mt-0.5">ID: {existing.id}</p>
                    )}
                  </div>
                  {/* Toggle switch */}
                  <button
                    onClick={() => handleToggleFeature(code, isEnabled, existing)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${
                      isEnabled ? 'bg-[#238636]' : 'bg-[#21262d]'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                        isEnabled ? 'left-5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>

                {/* Config editor (shown when enabled) */}
                {isEnabled && existing && (
                  <div className="mt-3 border-t border-[#30363d] pt-3">
                    {isEditingConfig ? (
                      <div className="space-y-2">
                        <label className="text-xs text-[#8b949e]">Config (JSON)</label>
                        <textarea
                          value={configValue}
                          onChange={(e) => setConfigValue(e.target.value)}
                          rows={4}
                          className="w-full bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] rounded-md px-3 py-2 text-xs font-mono focus:border-[#58a6ff] focus:outline-none"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSaveConfig(existing)}
                            className="px-3 py-1.5 text-xs bg-[#238636] text-white rounded-md hover:bg-[#2ea043] transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => { setEditingConfig(null); setConfigValue(''); }}
                            className="px-3 py-1.5 text-xs bg-[#21262d] text-[#c9d1d9] border border-[#30363d] rounded-md hover:bg-[#30363d] transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <code className="text-xs text-[#8b949e] bg-white/5 px-2 py-1 rounded max-w-md truncate block">
                          {existing.config ? JSON.stringify(existing.config) : '{}'}
                        </code>
                        <button
                          onClick={() => {
                            setEditingConfig(code);
                            setConfigValue(JSON.stringify(existing.config ?? {}, null, 2));
                          }}
                          className="text-xs text-[#58a6ff] hover:underline ml-3"
                        >
                          Edit config
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Tab: Errors */}
      {activeTab === 'errors' && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[#c9d1d9]">Error History (Last 12 Months)</h3>
            <button
              onClick={fetchData}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#21262d] text-[#c9d1d9] border border-[#30363d] rounded-md hover:bg-[#30363d] transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#30363d]">
                  <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Period</th>
                  <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Total Errors</th>
                  <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Critical</th>
                  <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Resolved</th>
                  <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Top Modules</th>
                </tr>
              </thead>
              <tbody>
                {errors.length > 0 ? (
                  errors.map((e, idx) => (
                    <tr key={idx} className="border-b border-[#30363d]/50 hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 text-[#c9d1d9] font-mono">{e.period}</td>
                      <td className="px-4 py-3 text-[#c9d1d9]">{e.totalErrors}</td>
                      <td className="px-4 py-3">
                        {e.criticalCount > 0 ? (
                          <span className="text-xs bg-red-900/50 text-red-400 border border-red-800 px-2 py-0.5 rounded">
                            {e.criticalCount}
                          </span>
                        ) : (
                          <span className="text-xs text-[#8b949e]">0</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[#8b949e] text-xs">{e.resolvedCount}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {(e.topModules ?? []).map((m) => (
                            <code key={m} className="text-xs bg-white/5 px-1.5 py-0.5 rounded text-[#8b949e]">
                              {m}
                            </code>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-[#8b949e]">
                      No error data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

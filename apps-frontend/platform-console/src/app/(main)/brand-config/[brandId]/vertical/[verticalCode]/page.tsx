'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, List, Sparkles, DollarSign, Save, Check } from 'lucide-react';
import { api } from '@/lib/api';

type Module = {
  id: string;
  module_code: string;
  module_name: string;
  display_name: string;
  description?: string;
  is_required: boolean;
  is_premium: boolean;
  color_theme?: string;
  addon_price?: number | null;
};

type Menu = {
  id: string;
  menu_code: string;
  menu_label: string;
  menu_description?: string;
  route?: string;
  depth_level: number;
};

type Feature = {
  id: string;
  feature_code: string;
  feature_name: string;
  description?: string;
  is_premium: boolean;
  is_beta: boolean;
  category?: string;
};

type EffectiveConfig = {
  vertical: {
    id: string;
    vertical_code: string;
    vertical_name: string;
    display_name: string;
    description?: string;
    color_theme?: string;
    base_price?: number | null;
    per_user_price?: number | null;
  };
  all_modules: Module[];
  all_menus: Menu[];
  all_features: Feature[];
  brand_config: {
    disabled_modules?: string[];
    hidden_menus?: string[];
    disabled_features?: string[];
    custom_price?: number | null;
    custom_per_user_price?: number | null;
    custom_name?: string | null;
    custom_description?: string | null;
  } | null;
};

type TabKey = 'modules' | 'menus' | 'features' | 'pricing';

const TABS: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'modules', label: 'Modules', icon: Package },
  { key: 'menus', label: 'Menus', icon: List },
  { key: 'features', label: 'Features', icon: Sparkles },
  { key: 'pricing', label: 'Pricing', icon: DollarSign },
];

export default function BrandVerticalOverridePage() {
  const params = useParams();
  const brandId = params.brandId as string;
  const verticalCode = params.verticalCode as string;

  const [config, setConfig] = useState<EffectiveConfig | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('modules');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [disabledModules, setDisabledModules] = useState<Set<string>>(new Set());
  const [hiddenMenus, setHiddenMenus] = useState<Set<string>>(new Set());
  const [disabledFeatures, setDisabledFeatures] = useState<Set<string>>(new Set());
  const [customPrice, setCustomPrice] = useState('');
  const [customPerUserPrice, setCustomPerUserPrice] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.brandConfig.effectiveConfig(brandId, verticalCode) as EffectiveConfig;
      setConfig(data);
      const bc = data.brand_config;
      setDisabledModules(new Set(bc?.disabled_modules ?? []));
      setHiddenMenus(new Set(bc?.hidden_menus ?? []));
      setDisabledFeatures(new Set(bc?.disabled_features ?? []));
      setCustomPrice(bc?.custom_price != null ? String(bc.custom_price) : '');
      setCustomPerUserPrice(bc?.custom_per_user_price != null ? String(bc.custom_per_user_price) : '');
    } catch {
      /* error handled via null config */
    } finally {
      setLoading(false);
    }
  }, [brandId, verticalCode]);

  useEffect(() => { load(); }, [load]);

  const toggle = (set: Set<string>, setFn: (s: Set<string>) => void, code: string) => {
    const next = new Set(set);
    if (next.has(code)) next.delete(code); else next.add(code);
    setFn(next);
  };

  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await api.brandConfig.updateOverrides(brandId, verticalCode, {
        disabled_modules: Array.from(disabledModules),
        hidden_menus: Array.from(hiddenMenus),
        disabled_features: Array.from(disabledFeatures),
        custom_price: customPrice !== '' ? parseFloat(customPrice) : null,
        custom_per_user_price: customPerUserPrice !== '' ? parseFloat(customPerUserPrice) : null,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      /* silent */
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-20 bg-console-sidebar border border-console-border rounded-lg animate-pulse" />
        <div className="h-10 bg-console-sidebar border border-console-border rounded-lg animate-pulse" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 bg-console-sidebar border border-console-border rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="bg-console-sidebar border border-console-border rounded-lg p-12 text-center">
        <p className="text-sm text-console-muted">Configuration not found or vertical not enabled for this brand.</p>
        <Link href={`/brand-config/${brandId}`} className="text-xs text-[#58a6ff] mt-2 inline-block">← Back to brand</Link>
      </div>
    );
  }

  const { vertical, all_modules, all_menus, all_features } = config;
  const disabledModCount = disabledModules.size;
  const hiddenMenuCount = hiddenMenus.size;
  const disabledFeatCount = disabledFeatures.size;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-console-muted">
        <Link href="/brand-config" className="hover:text-console-text">Brands</Link>
        <span>›</span>
        <Link href={`/brand-config/${brandId}`} className="hover:text-console-text">Brand</Link>
        <span>›</span>
        <span className="text-console-text">{vertical.vertical_name}</span>
      </div>

      {/* Header */}
      <div className="bg-console-sidebar border border-console-border rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/brand-config/${brandId}`} className="text-console-muted hover:text-console-text">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div
            className="w-10 h-10 rounded flex items-center justify-center text-white font-bold flex-shrink-0"
            style={{ backgroundColor: vertical.color_theme || '#7c3aed' }}
          >
            {vertical.display_name[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-sm font-semibold text-console-text">{vertical.vertical_name} — Brand Overrides</h1>
            <p className="text-xs text-console-muted">
              {disabledModCount > 0 && `${disabledModCount} module${disabledModCount > 1 ? 's' : ''} disabled`}
              {disabledModCount > 0 && hiddenMenuCount > 0 && ' · '}
              {hiddenMenuCount > 0 && `${hiddenMenuCount} menu${hiddenMenuCount > 1 ? 's' : ''} hidden`}
              {(disabledModCount === 0 && hiddenMenuCount === 0) && 'No overrides active'}
            </p>
          </div>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-colors ${
            saved
              ? 'bg-console-accent text-white'
              : 'bg-[#21262d] hover:bg-[#30363d] text-console-text border border-console-border disabled:opacity-50'
          }`}
        >
          {saved ? <><Check className="w-3.5 h-3.5" /> Saved</> : <><Save className="w-3.5 h-3.5" /> {saving ? 'Saving…' : 'Save Overrides'}</>}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-console-border">
        {TABS.map(({ key, label, icon: Icon }) => {
          const count = key === 'modules' ? all_modules.length
            : key === 'menus' ? all_menus.length
            : key === 'features' ? all_features.length
            : null;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 -mb-px transition-colors ${
                activeTab === key
                  ? 'border-[#58a6ff] text-[#58a6ff]'
                  : 'border-transparent text-console-muted hover:text-console-text'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
              {count != null && (
                <span className={`text-xs px-1 rounded ${activeTab === key ? 'bg-[#58a6ff]/20' : 'bg-console-card'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {activeTab === 'modules' && (
        <div className="space-y-2">
          {all_modules.length === 0 ? (
            <EmptyState label="No modules in this vertical" />
          ) : (
            all_modules.map((m) => {
              const isDisabled = disabledModules.has(m.module_code);
              return (
                <div
                  key={m.id}
                  className={`bg-console-sidebar border rounded-lg p-3 flex items-center justify-between transition-colors ${
                    isDisabled ? 'border-console-danger/40 opacity-70' : 'border-console-border'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ backgroundColor: m.color_theme || '#7c3aed' }}
                    >
                      {m.display_name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-console-text leading-tight">{m.module_name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-mono text-console-muted">{m.module_code}</span>
                        {m.is_required && <span className="text-xs bg-[#d29922]/20 text-[#d29922] px-1 rounded">required</span>}
                        {m.is_premium && <span className="text-xs bg-[#58a6ff]/20 text-[#58a6ff] px-1 rounded">premium</span>}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => !m.is_required && toggle(disabledModules, setDisabledModules, m.module_code)}
                    disabled={m.is_required}
                    className={`text-xs px-2.5 py-1 rounded border transition-colors ${
                      m.is_required
                        ? 'border-[#d29922]/40 text-[#d29922] cursor-not-allowed'
                        : isDisabled
                        ? 'border-console-danger/50 bg-console-danger/10 text-red-400 hover:bg-console-danger/20'
                        : 'border-[#238636]/50 bg-[#238636]/10 text-[#3fb950] hover:bg-[#238636]/20'
                    }`}
                  >
                    {m.is_required ? 'Required' : isDisabled ? 'Disabled' : 'Enabled'}
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'menus' && (
        <div className="space-y-2">
          {all_menus.length === 0 ? (
            <EmptyState label="No menus in this vertical" />
          ) : (
            all_menus.map((m) => {
              const isHidden = hiddenMenus.has(m.menu_code);
              return (
                <div
                  key={m.id}
                  className={`bg-console-sidebar border rounded-lg p-3 flex items-center justify-between transition-colors ${
                    isHidden ? 'border-console-danger/40 opacity-70' : 'border-console-border'
                  }`}
                  style={{ paddingLeft: `${(m.depth_level * 16) + 12}px` }}
                >
                  <div>
                    <p className="text-sm font-medium text-console-text leading-tight">{m.menu_label}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-mono text-console-muted">{m.menu_code}</span>
                      {m.route && <span className="text-xs text-console-muted">→ {m.route}</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => toggle(hiddenMenus, setHiddenMenus, m.menu_code)}
                    className={`text-xs px-2.5 py-1 rounded border transition-colors ${
                      isHidden
                        ? 'border-console-danger/50 bg-console-danger/10 text-red-400 hover:bg-console-danger/20'
                        : 'border-[#238636]/50 bg-[#238636]/10 text-[#3fb950] hover:bg-[#238636]/20'
                    }`}
                  >
                    {isHidden ? 'Hidden' : 'Visible'}
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'features' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {all_features.length === 0 ? (
            <EmptyState label="No features in this vertical" />
          ) : (
            all_features.map((f) => {
              const isDisabled = disabledFeatures.has(f.feature_code);
              return (
                <div
                  key={f.id}
                  className={`bg-console-sidebar border rounded-lg p-3 transition-colors ${
                    isDisabled ? 'border-console-danger/40 opacity-70' : 'border-console-border'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-console-text leading-tight">{f.feature_name}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs font-mono text-console-muted">{f.feature_code}</span>
                        {f.category && <span className="text-xs text-console-muted">{f.category}</span>}
                        {f.is_premium && <span className="text-xs bg-[#58a6ff]/20 text-[#58a6ff] px-1 rounded">premium</span>}
                        {f.is_beta && <span className="text-xs bg-[#d29922]/20 text-[#d29922] px-1 rounded">beta</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => toggle(disabledFeatures, setDisabledFeatures, f.feature_code)}
                      className={`flex-shrink-0 text-xs px-2.5 py-1 rounded border transition-colors ${
                        isDisabled
                          ? 'border-console-danger/50 bg-console-danger/10 text-red-400 hover:bg-console-danger/20'
                          : 'border-[#238636]/50 bg-[#238636]/10 text-[#3fb950] hover:bg-[#238636]/20'
                      }`}
                    >
                      {isDisabled ? 'Off' : 'On'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'pricing' && (
        <div className="bg-console-sidebar border border-console-border rounded-lg p-5 space-y-5">
          <div>
            <h3 className="text-xs font-semibold text-console-muted uppercase tracking-wide mb-4">Brand-Specific Pricing Overrides</h3>
            <p className="text-xs text-console-muted mb-4">
              Leave blank to use the vertical&apos;s default pricing.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-console-muted mb-1.5">
                  Custom Base Price (₹/month)
                  {vertical.base_price != null && (
                    <span className="ml-2 text-console-muted">default: ₹{Number(vertical.base_price).toLocaleString()}</span>
                  )}
                </label>
                <input
                  type="number"
                  className="w-full bg-console-bg border border-console-border rounded px-3 py-2 text-sm text-console-text placeholder-console-muted focus:outline-none focus:border-[#58a6ff]"
                  placeholder="e.g., 799"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-xs text-console-muted mb-1.5">
                  Custom Per-User Price (₹/user)
                  {vertical.per_user_price != null && (
                    <span className="ml-2 text-console-muted">default: ₹{Number(vertical.per_user_price).toLocaleString()}</span>
                  )}
                </label>
                <input
                  type="number"
                  className="w-full bg-console-bg border border-console-border rounded px-3 py-2 text-sm text-console-text placeholder-console-muted focus:outline-none focus:border-[#58a6ff]"
                  placeholder="e.g., 49"
                  value={customPerUserPrice}
                  onChange={(e) => setCustomPerUserPrice(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {(customPrice || customPerUserPrice) && (
            <div className="bg-console-bg border border-console-border rounded p-3">
              <p className="text-xs text-console-muted mb-2">Preview</p>
              <div className="flex gap-6 text-xs">
                {customPrice && (
                  <div>
                    <span className="text-console-muted">Base: </span>
                    <span className="text-[#3fb950] font-semibold">₹{parseFloat(customPrice).toLocaleString()}/mo</span>
                  </div>
                )}
                {customPerUserPrice && (
                  <div>
                    <span className="text-console-muted">Per user: </span>
                    <span className="text-[#3fb950] font-semibold">₹{parseFloat(customPerUserPrice).toLocaleString()}/user</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={save}
              disabled={saving}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-colors ${
                saved
                  ? 'bg-console-accent text-white'
                  : 'bg-[#21262d] hover:bg-[#30363d] text-console-text border border-console-border disabled:opacity-50'
              }`}
            >
              {saved ? <><Check className="w-3.5 h-3.5" /> Saved</> : <><Save className="w-3.5 h-3.5" /> {saving ? 'Saving…' : 'Save Pricing'}</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="bg-console-sidebar border border-console-border rounded-lg p-8 text-center">
      <p className="text-sm text-console-muted">{label}</p>
    </div>
  );
}

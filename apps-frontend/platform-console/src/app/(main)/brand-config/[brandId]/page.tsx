'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Palette, Layers, DollarSign, Eye,
  ToggleLeft, ToggleRight, Settings, Globe,
} from 'lucide-react';
import { api } from '@/lib/api';

type Brand = {
  id: string;
  brandCode: string;
  brandName: string;
  displayName: string;
  description?: string;
  primaryColor?: string;
  secondaryColor?: string;
  domain?: string;
  subdomain?: string;
  contactEmail?: string;
  logoUrl?: string;
  isActive: boolean;
  isDefault: boolean;
};

type VerticalWithConfig = {
  id: string;
  vertical_code: string;
  vertical_name: string;
  display_name: string;
  description?: string;
  color_theme?: string;
  base_price?: number | null;
  per_user_price?: number | null;
  pc_vertical_module: { id: string; module_code: string; module_name: string }[];
  pc_vertical_menu: { id: string; menu_code: string; menu_label: string }[];
  pc_vertical_feature: { id: string; feature_code: string; feature_name: string }[];
  brand_config: {
    custom_price?: number | null;
    custom_per_user_price?: number | null;
    disabled_modules?: string[];
    hidden_menus?: string[];
    disabled_features?: string[];
  } | null;
  is_enabled_for_brand: boolean;
};

type TabKey = 'overview' | 'verticals' | 'pricing' | 'preview';

const TABS: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'overview', label: 'Overview', icon: Palette },
  { key: 'verticals', label: 'Verticals', icon: Layers },
  { key: 'pricing', label: 'Pricing', icon: DollarSign },
  { key: 'preview', label: 'Preview', icon: Eye },
];

export default function BrandDetailPage() {
  const params = useParams();
  const brandId = params.brandId as string;

  const [brand, setBrand] = useState<Brand | null>(null);
  const [verticals, setVerticals] = useState<VerticalWithConfig[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [brandData, verticalsData] = await Promise.all([
        api.brandConfig.get(brandId) as Promise<Brand>,
        api.brandConfig.verticals(brandId) as Promise<VerticalWithConfig[]>,
      ]);
      setBrand(brandData);
      setVerticals(Array.isArray(verticalsData) ? verticalsData : []);
    } catch {
      setBrand(null);
    } finally {
      setLoading(false);
    }
  }, [brandId]);

  useEffect(() => { load(); }, [load]);

  const toggleVertical = async (verticalCode: string, enable: boolean) => {
    setToggling(verticalCode);
    try {
      if (enable) {
        await api.brandConfig.enableVertical(brandId, verticalCode);
      } else {
        await api.brandConfig.disableVertical(brandId, verticalCode);
      }
      await load();
    } catch {
      /* silent */
    } finally {
      setToggling(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-28 bg-console-sidebar border border-console-border rounded-lg animate-pulse" />
        <div className="h-10 bg-console-sidebar border border-console-border rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-36 bg-console-sidebar border border-console-border rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="bg-console-sidebar border border-console-border rounded-lg p-12 text-center">
        <p className="text-sm text-console-muted">Brand not found</p>
        <Link href="/brand-config" className="text-xs text-[#58a6ff] mt-2 inline-block">← Back to brands</Link>
      </div>
    );
  }

  const enabledCount = verticals.filter((v) => v.is_enabled_for_brand).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs text-console-muted">
        <Link href="/brand-config" className="hover:text-console-text flex items-center gap-1">
          <ArrowLeft className="w-3 h-3" /> Brands
        </Link>
        <span>›</span>
        <span className="text-console-text">{brand.brandName}</span>
      </div>

      {/* Brand header */}
      <div className="bg-console-sidebar border border-console-border rounded-lg p-5">
        <div className="flex items-start gap-4">
          <div
            className="w-14 h-14 rounded-lg flex items-center justify-center text-white font-bold text-2xl flex-shrink-0"
            style={{ backgroundColor: brand.primaryColor || '#1976d2' }}
          >
            {brand.brandName[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-console-text">{brand.brandName}</h1>
            <p className="text-xs font-mono text-console-muted">{brand.brandCode}</p>
            {brand.description && (
              <p className="text-xs text-console-muted mt-1 truncate">{brand.description}</p>
            )}
            {brand.domain && (
              <p className="text-xs text-console-muted flex items-center gap-1 mt-1">
                <Globe className="w-3 h-3" /> {brand.domain}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {brand.isDefault && (
              <span className="bg-[#d29922]/20 text-[#d29922] text-xs px-2 py-0.5 rounded">Default</span>
            )}
            {brand.isActive ? (
              <span className="bg-[#238636]/20 text-[#3fb950] text-xs px-2 py-0.5 rounded">Active</span>
            ) : (
              <span className="bg-[#30363d] text-console-muted text-xs px-2 py-0.5 rounded">Inactive</span>
            )}
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 border-b border-console-border">
        {TABS.map(({ key, label, icon: Icon }) => (
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
            {key === 'verticals' && (
              <span className={`text-xs px-1 rounded ${activeTab === key ? 'bg-[#58a6ff]/20' : 'bg-console-card'}`}>
                {enabledCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && <OverviewTab brand={brand} enabledCount={enabledCount} totalVerticals={verticals.length} />}
      {activeTab === 'verticals' && (
        <VerticalsTab brandId={brandId} verticals={verticals} toggling={toggling} onToggle={toggleVertical} />
      )}
      {activeTab === 'pricing' && <PricingTab verticals={verticals} />}
      {activeTab === 'preview' && <PreviewTab brand={brand} verticals={verticals} />}
    </div>
  );
}

function OverviewTab({ brand, enabledCount, totalVerticals }: { brand: Brand; enabledCount: number; totalVerticals: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-console-sidebar border border-console-border rounded-lg p-4">
        <h3 className="text-xs font-semibold text-console-muted uppercase tracking-wide mb-3">Identity</h3>
        <dl className="space-y-2">
          <Row label="Display Name" value={brand.displayName} />
          <Row label="Domain" value={brand.domain} mono />
          <Row label="Subdomain" value={brand.subdomain} mono />
          <Row label="Contact" value={brand.contactEmail} />
        </dl>
      </div>
      <div className="bg-console-sidebar border border-console-border rounded-lg p-4">
        <h3 className="text-xs font-semibold text-console-muted uppercase tracking-wide mb-3">Branding</h3>
        <div className="space-y-3">
          <ColorRow label="Primary" color={brand.primaryColor} />
          <ColorRow label="Secondary" color={brand.secondaryColor} />
        </div>
      </div>
      <div className="bg-console-sidebar border border-console-border rounded-lg p-4 md:col-span-2">
        <h3 className="text-xs font-semibold text-console-muted uppercase tracking-wide mb-3">Summary</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <Stat label="Verticals Enabled" value={`${enabledCount}/${totalVerticals}`} color="text-[#58a6ff]" />
          <Stat label="Status" value={brand.isActive ? 'Active' : 'Inactive'} color={brand.isActive ? 'text-[#3fb950]' : 'text-console-muted'} />
          <Stat label="Type" value={brand.isDefault ? 'Default' : 'Custom'} color="text-[#d29922]" />
        </div>
      </div>
    </div>
  );
}

function VerticalsTab({
  brandId, verticals, toggling, onToggle,
}: {
  brandId: string;
  verticals: VerticalWithConfig[];
  toggling: string | null;
  onToggle: (code: string, enable: boolean) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-console-muted">
        Toggle to enable/disable verticals for this brand. Enabled verticals can be further configured with overrides.
      </p>
      {verticals.length === 0 ? (
        <div className="bg-console-sidebar border border-console-border rounded-lg p-8 text-center">
          <Layers className="w-8 h-8 mx-auto mb-2 text-console-muted opacity-30" />
          <p className="text-sm text-console-muted">No verticals available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {verticals.map((v) => {
            const isToggling = toggling === v.vertical_code;
            return (
              <div
                key={v.id}
                className={`bg-console-sidebar border rounded-lg p-4 transition-colors ${
                  v.is_enabled_for_brand ? 'border-[#238636]/50' : 'border-console-border'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-10 h-10 rounded flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                      style={{ backgroundColor: v.color_theme || '#7c3aed' }}
                    >
                      {v.display_name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-console-text leading-tight">{v.vertical_name}</p>
                      <p className="text-xs font-mono text-console-muted">{v.vertical_code}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onToggle(v.vertical_code, !v.is_enabled_for_brand)}
                    disabled={isToggling}
                    className="disabled:opacity-50 transition-opacity"
                    title={v.is_enabled_for_brand ? 'Disable for brand' : 'Enable for brand'}
                  >
                    {v.is_enabled_for_brand ? (
                      <ToggleRight className="w-7 h-7 text-[#3fb950]" />
                    ) : (
                      <ToggleLeft className="w-7 h-7 text-console-muted" />
                    )}
                  </button>
                </div>

                {v.description && (
                  <p className="text-xs text-console-muted mb-3 line-clamp-2">{v.description}</p>
                )}

                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-console-border text-center">
                  <MiniStat label="Modules" value={v.pc_vertical_module.length} color="text-[#58a6ff]" />
                  <MiniStat label="Menus" value={v.pc_vertical_menu.length} color="text-[#3fb950]" />
                  <MiniStat label="Features" value={v.pc_vertical_feature.length} color="text-[#d29922]" />
                </div>

                {v.is_enabled_for_brand && (
                  <Link
                    href={`/brand-config/${brandId}/vertical/${v.vertical_code}`}
                    className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs bg-console-card hover:bg-[#21262d] text-console-text border border-console-border rounded py-1.5 transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5" /> Configure Overrides
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PricingTab({ verticals }: { verticals: VerticalWithConfig[] }) {
  const enabled = verticals.filter((v) => v.is_enabled_for_brand);
  return (
    <div className="bg-console-sidebar border border-console-border rounded-lg p-4">
      <h3 className="text-xs font-semibold text-console-muted uppercase tracking-wide mb-4">Pricing — Enabled Verticals</h3>
      {enabled.length === 0 ? (
        <p className="text-xs text-console-muted">No verticals enabled. Enable verticals to configure pricing.</p>
      ) : (
        <table className="w-full text-xs">
          <thead className="text-console-muted border-b border-console-border">
            <tr>
              <th className="text-left py-2">Vertical</th>
              <th className="text-right py-2">Base Price</th>
              <th className="text-right py-2">Per User</th>
              <th className="text-right py-2">Brand Override</th>
            </tr>
          </thead>
          <tbody>
            {enabled.map((v) => (
              <tr key={v.id} className="border-b border-console-border">
                <td className="py-3">
                  <p className="font-medium text-console-text">{v.vertical_name}</p>
                  <p className="text-console-muted font-mono">{v.vertical_code}</p>
                </td>
                <td className="text-right text-console-muted">
                  {v.base_price != null ? `₹${Number(v.base_price).toLocaleString()}` : '—'}
                </td>
                <td className="text-right text-console-muted">
                  {v.per_user_price != null ? `₹${Number(v.per_user_price).toLocaleString()}` : '—'}
                </td>
                <td className="text-right">
                  {v.brand_config?.custom_price != null ? (
                    <span className="text-[#3fb950]">₹{Number(v.brand_config.custom_price).toLocaleString()}</span>
                  ) : (
                    <span className="text-console-muted">Default</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function PreviewTab({ brand, verticals }: { brand: Brand; verticals: VerticalWithConfig[] }) {
  const enabled = verticals.filter((v) => v.is_enabled_for_brand);
  return (
    <div className="space-y-4">
      <div
        className="rounded-lg p-6 text-white"
        style={{
          background: `linear-gradient(135deg, ${brand.primaryColor || '#1976d2'} 0%, ${brand.secondaryColor || '#dc004e'} 100%)`,
        }}
      >
        <p className="text-xs font-mono opacity-70 mb-1">{brand.brandCode}</p>
        <h2 className="text-xl font-bold">{brand.displayName}</h2>
        {brand.description && <p className="text-sm opacity-80 mt-1">{brand.description}</p>}
        <p className="text-xs mt-3 opacity-60">{enabled.length} verticals enabled</p>
      </div>

      {enabled.length > 0 && (
        <div className="bg-console-sidebar border border-console-border rounded-lg p-4">
          <h3 className="text-xs font-semibold text-console-muted uppercase tracking-wide mb-3">Enabled Verticals</h3>
          <div className="flex flex-wrap gap-2">
            {enabled.map((v) => (
              <span
                key={v.id}
                className="text-xs px-2 py-1 rounded text-white"
                style={{ backgroundColor: v.color_theme || '#7c3aed' }}
              >
                {v.vertical_name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value?: string | null; mono?: boolean }) {
  return (
    <div className="flex justify-between text-xs">
      <dt className="text-console-muted">{label}</dt>
      <dd className={`text-console-text ${mono ? 'font-mono' : ''}`}>{value || '—'}</dd>
    </div>
  );
}

function ColorRow({ label, color }: { label: string; color?: string | null }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-console-muted">{label}</span>
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded border border-console-border" style={{ backgroundColor: color || '#888' }} />
        <span className="font-mono text-console-text">{color || '—'}</span>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-console-muted mt-0.5">{label}</p>
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <p className={`text-sm font-bold ${color}`}>{value}</p>
      <p className="text-xs text-console-muted">{label}</p>
    </div>
  );
}

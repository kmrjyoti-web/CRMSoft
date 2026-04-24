'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Layers, Package, List, Sparkles, ArrowRight, Plane, Smartphone, Code, Building2 } from 'lucide-react';
import { api } from '@/lib/api';

type VerticalSummary = {
  id: string;
  verticalCode: string;
  verticalName: string;
  displayName: string;
  description?: string;
  colorTheme?: string;
  isActive: boolean;
  isBeta: boolean;
  isComingSoon: boolean;
  basePrice?: number;
  perUserPrice?: number;
  _count: { modules: number; menus: number; features: number };
};

const ICON_MAP: Record<string, React.ElementType> = {
  CRM_GENERAL: Building2,
  TRAVEL: Plane,
  ELECTRONIC: Smartphone,
  SOFTWARE: Code,
};

export default function VerticalConfigPage() {
  const [verticals, setVerticals] = useState<VerticalSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = (await api.verticalConfig.list()) as VerticalSummary[] | any;
      setVerticals(Array.isArray(data) ? data : data.items ?? []);
    } catch {
      setVerticals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totals = verticals.reduce(
    (acc, v) => ({
      modules: acc.modules + (v._count?.modules ?? 0),
      menus: acc.menus + (v._count?.menus ?? 0),
      features: acc.features + (v._count?.features ?? 0),
    }),
    { modules: 0, menus: 0, features: 0 },
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-[#161b22] border border-[#30363d] rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-48 bg-[#161b22] border border-[#30363d] rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-[#c9d1d9] flex items-center gap-2">
          <Layers className="w-4 h-4" /> Vertical Configuration
        </h2>
        <p className="text-xs text-[#8b949e] mt-0.5">
          Module structure, menus, and features for each CRMSoft vertical
        </p>
      </div>

      {/* Platform-wide counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Verticals', value: verticals.length, icon: Layers, color: '#a78bfa' },
          { label: 'Modules', value: totals.modules, icon: Package, color: '#58a6ff' },
          { label: 'Menus', value: totals.menus, icon: List, color: '#3fb950' },
          { label: 'Features', value: totals.features, icon: Sparkles, color: '#f0883e' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#8b949e] uppercase tracking-wide">{label}</p>
                <p className="text-2xl font-bold text-[#c9d1d9] mt-1">{value}</p>
              </div>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
          </div>
        ))}
      </div>

      {/* Vertical cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {verticals.map(v => {
          const Icon = ICON_MAP[v.verticalCode] ?? Layers;
          return (
            <Link
              key={v.id}
              href={`/vertical-config/${v.verticalCode}`}
              className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 hover:border-[#58a6ff]/50 transition-colors block"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: v.colorTheme ?? '#238636' }}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#c9d1d9]">{v.verticalName}</h3>
                    <p className="text-xs font-mono text-[#8b949e]">{v.verticalCode}</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#484f58]" />
              </div>

              {v.description && (
                <p className="text-xs text-[#8b949e] mb-3 line-clamp-2">{v.description}</p>
              )}

              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#21262d] text-center text-xs">
                <div>
                  <p className="text-base font-bold text-[#58a6ff]">{v._count.modules}</p>
                  <p className="text-[#484f58] uppercase tracking-wide">Modules</p>
                </div>
                <div>
                  <p className="text-base font-bold text-[#3fb950]">{v._count.menus}</p>
                  <p className="text-[#484f58] uppercase tracking-wide">Menus</p>
                </div>
                <div>
                  <p className="text-base font-bold text-[#f0883e]">{v._count.features}</p>
                  <p className="text-[#484f58] uppercase tracking-wide">Features</p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs">
                <div className="flex gap-1.5">
                  {v.isActive && (
                    <span className="bg-green-900/40 text-green-400 border border-green-800 px-2 py-0.5 rounded">Active</span>
                  )}
                  {v.isBeta && (
                    <span className="bg-yellow-900/40 text-yellow-400 border border-yellow-800 px-2 py-0.5 rounded">Beta</span>
                  )}
                  {v.isComingSoon && (
                    <span className="bg-[#21262d] text-[#8b949e] border border-[#30363d] px-2 py-0.5 rounded">Coming Soon</span>
                  )}
                </div>
                {v.basePrice && (
                  <span className="text-[#8b949e]">
                    ₹{v.basePrice}/mo + ₹{v.perUserPrice}/user
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

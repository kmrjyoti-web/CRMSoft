'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Layers, Users, Palette, Factory, Tag, Building2, FileText, ListFilter, Zap, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';

type StatCard = { label: string; count: number; href: string; icon: React.ElementType; color: string };

export default function GovernanceOverviewPage() {
  const [stats, setStats] = useState<StatCard[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [partners, brands, editions, verticals, pages, codes] = await Promise.all([
        api.pcConfig.partners() as Promise<unknown[]>,
        api.pcConfig.brands() as Promise<unknown[]>,
        api.pcConfig.crmEditions() as Promise<unknown[]>,
        api.pcConfig.verticals() as Promise<unknown[]>,
        api.pcConfig.pageRegistry() as Promise<unknown[]>,
        api.pcConfig.combinedCodes() as Promise<unknown[]>,
      ]);
      setStats([
        { label: 'Partners', count: Array.isArray(partners) ? partners.length : 0, href: '/governance/partners', icon: Users, color: '#58a6ff' },
        { label: 'Brands', count: Array.isArray(brands) ? brands.length : 0, href: '/governance/brands', icon: Palette, color: '#d29922' },
        { label: 'CRM Editions', count: Array.isArray(editions) ? editions.length : 0, href: '/governance/crm-editions', icon: Factory, color: '#3fb950' },
        { label: 'Verticals', count: Array.isArray(verticals) ? verticals.length : 0, href: '/governance/verticals', icon: Tag, color: '#bc8cff' },
        { label: 'Combined Codes', count: Array.isArray(codes) ? codes.length : 0, href: '/governance/combined-codes', icon: ListFilter, color: '#ff7b72' },
        { label: 'Page Registry', count: Array.isArray(pages) ? pages.length : 0, href: '/governance/page-registry', icon: FileText, color: '#79c0ff' },
      ]);
    } catch {
      setStats([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-console-text flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#58a6ff]" />
            Governance Overview
          </h2>
          <p className="text-xs text-console-muted mt-0.5">
            6-layer cascade — Partner → Brand → CRM Edition → Vertical → User Type → Sub-Type
          </p>
        </div>
        <Link
          href="/governance/combined-codes/builder"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-console-accent text-white rounded-md hover:bg-console-accent/80 transition-colors"
        >
          <Zap className="w-3.5 h-3.5" /> Code Builder
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 bg-console-sidebar border border-console-border rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <Link
                key={s.href}
                href={s.href}
                className="bg-console-sidebar border border-console-border rounded-lg p-4 hover:border-[#58a6ff]/50 transition-colors group"
              >
                <div className="flex items-center justify-between mb-3">
                  <Icon className="w-5 h-5" style={{ color: s.color }} />
                  <ArrowRight className="w-3.5 h-3.5 text-console-muted group-hover:text-[#58a6ff] transition-colors" />
                </div>
                <p className="text-2xl font-bold text-console-text">{s.count}</p>
                <p className="text-xs text-console-muted mt-0.5">{s.label}</p>
              </Link>
            );
          })}
        </div>
      )}

      <div className="bg-console-sidebar border border-console-border rounded-lg p-4">
        <p className="text-xs font-semibold text-console-text mb-3 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-[#58a6ff]" />
          Cascade Hierarchy
        </p>
        <div className="flex items-center gap-2 flex-wrap text-xs text-console-muted">
          {[
            { label: 'Partner', color: '#58a6ff' },
            { label: 'Brand', color: '#d29922' },
            { label: 'CRM Edition', color: '#3fb950' },
            { label: 'Vertical', color: '#bc8cff' },
            { label: 'User Type', color: '#ff7b72' },
            { label: 'Sub-Type', color: '#79c0ff' },
          ].map((l, i, arr) => (
            <span key={l.label} className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-white text-xs" style={{ backgroundColor: l.color + '33', color: l.color }}>{l.label}</span>
              {i < arr.length - 1 && <span className="opacity-30">→</span>}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

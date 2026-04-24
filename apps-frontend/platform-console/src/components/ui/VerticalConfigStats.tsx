'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Layers, Package, List, Sparkles } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

type Stats = { verticals: number; modules: number; menus: number; features: number };

export function VerticalConfigStats() {
  const [stats, setStats] = useState<Stats>({ verticals: 0, modules: 0, menus: 0, features: 0 });

  useEffect(() => {
    fetch(`${API_BASE}/platform-console/vertical-config`)
      .then(r => r.json())
      .then((data: any) => {
        const arr: any[] = Array.isArray(data) ? data : data?.items ?? [];
        setStats(arr.reduce(
          (acc, v) => ({
            verticals: acc.verticals + 1,
            modules: acc.modules + (v._count?.modules ?? 0),
            menus: acc.menus + (v._count?.menus ?? 0),
            features: acc.features + (v._count?.features ?? 0),
          }),
          { verticals: 0, modules: 0, menus: 0, features: 0 },
        ));
      })
      .catch(() => {});
  }, []);

  const items = [
    { label: 'Verticals', value: stats.verticals, icon: Layers, color: '#a78bfa' },
    { label: 'Modules', value: stats.modules, icon: Package, color: '#58a6ff' },
    { label: 'Menus', value: stats.menus, icon: List, color: '#3fb950' },
    { label: 'Features', value: stats.features, icon: Sparkles, color: '#f0883e' },
  ];

  return (
    <div className="bg-console-card border border-console-border rounded-lg p-4">
      <h2 className="text-sm font-semibold text-console-text mb-3 flex items-center gap-2">
        <Layers className="w-4 h-4 text-console-accent" />
        <Link href="/vertical-config" className="hover:text-[#58a6ff] transition-colors">
          Vertical Configuration
        </Link>
      </h2>
      <div className="grid grid-cols-4 gap-3">
        {items.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="text-center">
            <Icon className="w-4 h-4 mx-auto mb-1" style={{ color }} />
            <p className="text-lg font-bold text-console-text">{value || '—'}</p>
            <p className="text-xs text-console-muted uppercase tracking-wide">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

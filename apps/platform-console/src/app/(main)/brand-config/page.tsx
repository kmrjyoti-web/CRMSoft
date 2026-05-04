'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Palette, Globe, Layers, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';

type Brand = {
  id: string;
  brandCode: string;
  brandName: string;
  displayName: string;
  description?: string;
  primaryColor?: string;
  domain?: string;
  isActive: boolean;
  isDefault: boolean;
  enabledVerticalCount: number;
};

export default function BrandConfigIndexPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.brandConfig.list() as Brand[] | { items?: Brand[] };
      setBrands(Array.isArray(data) ? data : (data as any).items ?? []);
    } catch {
      setBrands([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 bg-console-sidebar border border-console-border rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-console-text flex items-center gap-2">
            <Palette className="w-4 h-4 text-[#58a6ff]" />
            Brand Configuration
          </h2>
          <p className="text-xs text-console-muted mt-0.5">
            {brands.length} brand{brands.length !== 1 ? 's' : ''} — assign verticals and configure overrides
          </p>
        </div>
        <Link
          href="/brand-config/new"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-console-accent text-white rounded-md hover:bg-console-accent/80 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Create Brand
        </Link>
      </div>

      {brands.length === 0 ? (
        <div className="bg-console-sidebar border border-console-border rounded-lg p-12 text-center">
          <Palette className="w-10 h-10 mx-auto mb-3 text-console-muted opacity-30" />
          <p className="text-sm text-console-muted">No brands yet</p>
          <Link
            href="/brand-config/new"
            className="inline-flex items-center gap-1.5 mt-4 px-3 py-1.5 text-xs bg-console-accent text-white rounded-md hover:bg-console-accent/80 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Create First Brand
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {brands.map((b) => (
            <Link
              key={b.id}
              href={`/brand-config/${b.id}`}
              className="bg-console-sidebar border border-console-border rounded-lg p-4 hover:border-[#58a6ff]/50 transition-colors group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-base flex-shrink-0"
                    style={{ backgroundColor: b.primaryColor || '#1976d2' }}
                  >
                    {b.brandName[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-console-text group-hover:text-[#58a6ff] transition-colors leading-tight">
                      {b.brandName}
                    </p>
                    <p className="text-xs font-mono text-console-muted mt-0.5">{b.brandCode}</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-console-muted group-hover:text-[#58a6ff] transition-colors flex-shrink-0 mt-0.5" />
              </div>

              {b.domain && (
                <p className="text-xs text-console-muted flex items-center gap-1 mb-3">
                  <Globe className="w-3 h-3" /> {b.domain}
                </p>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-console-border">
                <div className="flex items-center gap-1 text-xs text-console-muted">
                  <Layers className="w-3.5 h-3.5 text-[#58a6ff]" />
                  <span className="font-semibold text-console-text">{b.enabledVerticalCount}</span>
                  <span>verticals</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {b.isDefault && (
                    <span className="bg-[#d29922]/20 text-[#d29922] text-xs px-1.5 py-0.5 rounded">Default</span>
                  )}
                  {b.isActive ? (
                    <span className="bg-[#238636]/20 text-[#3fb950] text-xs px-1.5 py-0.5 rounded">Active</span>
                  ) : (
                    <span className="bg-[#30363d] text-console-muted text-xs px-1.5 py-0.5 rounded">Inactive</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

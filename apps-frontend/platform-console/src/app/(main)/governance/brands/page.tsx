'use client';

import { useState, useEffect, useCallback } from 'react';
import { Palette, Globe } from 'lucide-react';
import { api } from '@/lib/api';

type Brand = {
  id: string;
  code: string;
  shortCode?: string;
  name: string;
  description?: string;
  domain?: string;
  subdomain?: string;
  isActive: boolean;
  partnerId?: string;
};

export default function GovernanceBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.pcConfig.brands() as Brand[];
      setBrands(Array.isArray(data) ? data : []);
    } catch {
      setBrands([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-console-text flex items-center gap-2">
          <Palette className="w-4 h-4 text-[#d29922]" />
          Brands
        </h2>
        <p className="text-xs text-console-muted mt-0.5">
          Layer 2 — white-label brand identities linked to partners
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-console-sidebar border border-console-border rounded-lg animate-pulse" />
          ))}
        </div>
      ) : brands.length === 0 ? (
        <div className="bg-console-sidebar border border-console-border rounded-lg p-12 text-center">
          <Palette className="w-10 h-10 mx-auto mb-3 text-console-muted opacity-30" />
          <p className="text-sm text-console-muted">No brands found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {brands.map((b) => (
            <div
              key={b.id}
              className="bg-console-sidebar border border-console-border rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-semibold text-console-text">{b.name}</p>
                  <p className="text-xs font-mono text-console-muted mt-0.5">{b.code}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  {b.shortCode && (
                    <span className="bg-[#30363d] text-console-muted text-xs px-1.5 py-0.5 rounded font-mono">{b.shortCode}</span>
                  )}
                  {b.isActive ? (
                    <span className="bg-[#238636]/20 text-[#3fb950] text-xs px-1.5 py-0.5 rounded">Active</span>
                  ) : (
                    <span className="bg-[#30363d] text-console-muted text-xs px-1.5 py-0.5 rounded">Inactive</span>
                  )}
                </div>
              </div>
              {(b.domain || b.subdomain) && (
                <p className="text-xs text-console-muted flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  {b.domain ?? b.subdomain}
                </p>
              )}
              {b.description && (
                <p className="text-xs text-console-muted mt-1.5 line-clamp-2">{b.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

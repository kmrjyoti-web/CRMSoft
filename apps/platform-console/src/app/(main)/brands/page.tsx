'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Building2, AlertTriangle, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';

type Brand = {
  brandId: string;
  name?: string;
  modulesCount: number;
  featuresCount: number;
  totalErrors: number;
  criticalCount: number;
};

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.brands.list() as Brand[] | { items: Brand[] };
      setBrands(Array.isArray(data) ? data : (data as any).items ?? []);
    } catch {
      setBrands([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 bg-[#161b22] border border-[#30363d] rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#c9d1d9]">All Brands</h2>
          <p className="text-xs text-[#8b949e] mt-0.5">{brands.length} brand{brands.length !== 1 ? 's' : ''} registered</p>
        </div>
        <Link
          href="/brands/errors"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#21262d] text-[#c9d1d9] border border-[#30363d] rounded-md hover:bg-[#30363d] transition-colors"
        >
          <AlertTriangle className="w-3.5 h-3.5" /> Error Overview
        </Link>
      </div>

      {/* Brand cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {brands.length > 0 ? (
          brands.map((b) => (
            <Link
              key={b.brandId}
              href={`/brands/${b.brandId}`}
              className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 hover:border-[#58a6ff]/50 transition-colors group"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-[#c9d1d9] group-hover:text-[#58a6ff] transition-colors">
                    {b.brandId}
                  </p>
                  {b.name && <p className="text-xs text-[#8b949e] mt-0.5">{b.name}</p>}
                </div>
                {b.criticalCount > 0 ? (
                  <span className="flex items-center gap-1 text-xs bg-red-900/50 text-red-400 border border-red-800 px-2 py-0.5 rounded">
                    <AlertTriangle className="w-3 h-3" /> {b.criticalCount} critical
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs bg-green-900/50 text-green-400 border border-green-800 px-2 py-0.5 rounded">
                    <CheckCircle className="w-3 h-3" /> Healthy
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs text-[#8b949e] mb-2">
                <span>{b.modulesCount} modules</span>
                <span>{b.featuresCount} features</span>
              </div>

              {b.totalErrors > 0 && (
                <p className="text-xs text-[#8b949e]">
                  {b.totalErrors} total error{b.totalErrors !== 1 ? 's' : ''}
                </p>
              )}
            </Link>
          ))
        ) : (
          <div className="col-span-3 bg-[#161b22] border border-[#30363d] rounded-lg p-8 text-center">
            <Building2 className="w-8 h-8 mx-auto mb-2 text-[#8b949e] opacity-30" />
            <p className="text-sm text-[#8b949e]">No brands found</p>
          </div>
        )}
      </div>
    </div>
  );
}

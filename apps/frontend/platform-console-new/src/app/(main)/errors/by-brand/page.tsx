'use client';

import { useState, useCallback, useEffect } from 'react';
import { Building2 } from 'lucide-react';
import { api } from '@/lib/api';
import Link from 'next/link';

type BrandErrorGroup = {
  brandId: string;
  brandName?: string;
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  escalated: number;
};

type ByBrandResponse = {
  items: BrandErrorGroup[];
  total: number;
};

function SeverityBar({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`text-xs w-16 ${color}`}>{label}</span>
      <div className="flex-1 bg-white/5 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full rounded-full ${color.replace('text-', 'bg-')}`}
          style={{ width: `${Math.min(100, count)}%` }}
        />
      </div>
      <span className={`text-xs font-medium w-6 text-right ${color}`}>{count}</span>
    </div>
  );
}

export default function ErrorsByBrandPage() {
  const [data, setData] = useState<ByBrandResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = (await api.errors.byBrand()) as ByBrandResponse;
      setData(result);
    } catch {
      setData({ items: [], total: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#c9d1d9]">Errors by Brand</h2>
          <p className="text-xs text-[#8b949e] mt-0.5">
            Error distribution across all white-label brands
          </p>
        </div>
        {data && (
          <span className="text-xs text-[#8b949e]">{data.items?.length ?? 0} brands</span>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 space-y-3 animate-pulse"
            >
              <div className="h-5 bg-white/5 rounded w-2/3" />
              <div className="h-4 bg-white/5 rounded w-1/3" />
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((__, j) => (
                  <div key={j} className="h-3 bg-white/5 rounded" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : data?.items?.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.items.map((brand) => (
            <Link
              key={brand.brandId}
              href={`/errors?brand=${brand.brandId}`}
              className="block bg-[#161b22] border border-[#30363d] rounded-lg p-4 hover:border-[#58a6ff]/50 transition-colors group"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-[#c9d1d9] group-hover:text-[#58a6ff] transition-colors">
                    {brand.brandName ?? brand.brandId}
                  </p>
                  {brand.brandName && (
                    <p className="text-xs text-[#8b949e]">{brand.brandId}</p>
                  )}
                </div>
                <Building2 className="w-4 h-4 text-[#8b949e] flex-shrink-0" />
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl font-bold text-[#c9d1d9]">
                  {brand.total.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-[#8b949e]">total errors</span>
              </div>

              <div className="space-y-1.5">
                <SeverityBar label="CRITICAL" count={brand.critical} color="text-red-400" />
                <SeverityBar label="HIGH" count={brand.high} color="text-orange-400" />
                <SeverityBar label="MEDIUM" count={brand.medium} color="text-yellow-400" />
                <SeverityBar label="LOW" count={brand.low} color="text-blue-400" />
              </div>

              {brand.escalated > 0 && (
                <div className="mt-3 pt-3 border-t border-[#30363d] flex items-center justify-between">
                  <span className="text-xs text-[#8b949e]">Escalated</span>
                  <span className="text-xs font-semibold text-red-400">{brand.escalated}</span>
                </div>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg px-4 py-12 text-center text-[#8b949e]">
          <Building2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
          No brand error data found
        </div>
      )}
    </div>
  );
}

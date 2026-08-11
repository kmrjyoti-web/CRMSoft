'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';

type BrandErrorSummary = {
  brandId: string;
  totalErrors: number;
  criticalCount: number;
  resolvedCount: number;
  topModules: string[];
};

type ErrorOverview = {
  totalAcrossAll: number;
  worstBrand: string;
  brands: BrandErrorSummary[];
};

export default function BrandErrorOverviewPage() {
  const [data, setData] = useState<ErrorOverview | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.brands.errorOverview() as ErrorOverview;
      setData(result);
    } catch {
      setData(null);
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
        <div className="h-24 bg-[#161b22] border border-[#30363d] rounded-lg animate-pulse" />
        <div className="h-64 bg-[#161b22] border border-[#30363d] rounded-lg animate-pulse" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-8 text-center">
        <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-[#8b949e] opacity-30" />
        <p className="text-sm text-[#8b949e]">Failed to load error overview</p>
      </div>
    );
  }

  const sortedBrands = [...(data.brands ?? [])].sort((a, b) => b.totalErrors - a.totalErrors);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
          <p className="text-xs text-[#8b949e] mb-1">Total Errors Across All Brands</p>
          <p className="text-2xl font-bold text-[#c9d1d9]">{data.totalAcrossAll}</p>
        </div>
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
          <p className="text-xs text-[#8b949e] mb-1">Worst Brand</p>
          <p className="text-2xl font-bold text-red-400">{data.worstBrand || 'N/A'}</p>
        </div>
      </div>

      {/* Table */}
      <div>
        <h2 className="text-base font-semibold text-[#c9d1d9] mb-3">Brands by Error Count</h2>
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#30363d]">
                <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Brand</th>
                <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Total Errors</th>
                <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Critical</th>
                <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Resolved</th>
                <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Top Modules</th>
              </tr>
            </thead>
            <tbody>
              {sortedBrands.length > 0 ? (
                sortedBrands.map((b) => (
                  <tr
                    key={b.brandId}
                    className="border-b border-[#30363d]/50 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link href={`/brands/${b.brandId}`} className="text-[#58a6ff] hover:underline font-medium">
                        {b.brandId}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-[#c9d1d9] font-mono">{b.totalErrors}</td>
                    <td className="px-4 py-3">
                      {b.criticalCount > 0 ? (
                        <span className="text-xs bg-red-900/50 text-red-400 border border-red-800 px-2 py-0.5 rounded">
                          {b.criticalCount}
                        </span>
                      ) : (
                        <span className="text-xs text-[#8b949e]">0</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[#8b949e] text-xs">{b.resolvedCount}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(b.topModules ?? []).map((m) => (
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
                    <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No brand error data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

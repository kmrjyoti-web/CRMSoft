'use client';

import { useState, useCallback, useEffect } from 'react';
import { SeverityBadge } from '@/components/ui/SeverityBadge';
import { Bot } from 'lucide-react';
import { api } from '@/lib/api';
import Link from 'next/link';

type AutoReport = {
  id: string;
  errorCode: string;
  triggerRule: string;
  brandId?: string;
  count: number;
  firstSeen: string;
  lastSeen: string;
  status: 'OPEN' | 'RESOLVED';
  severity: string;
};

type AutoReportResponse = {
  items: AutoReport[];
  total: number;
  page: number;
  totalPages: number;
};

const STATUS_STYLES: Record<string, string> = {
  OPEN: 'bg-yellow-900/40 text-yellow-400 border-yellow-800',
  RESOLVED: 'bg-green-900/40 text-green-400 border-green-800',
};

export default function AutoReportsPage() {
  const [data, setData] = useState<AutoReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'RESOLVED'>('ALL');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = (await api.errors.autoReports({ page, limit: 20 })) as AutoReportResponse;
      setData(result);
    } catch {
      setData({ items: [], total: 0, page: 1, totalPages: 0 });
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered =
    statusFilter === 'ALL'
      ? data?.items ?? []
      : (data?.items ?? []).filter((r) => r.status === statusFilter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#c9d1d9]">Auto-Reports</h2>
          <p className="text-xs text-[#8b949e] mt-0.5">
            Errors automatically reported when threshold rules are triggered
          </p>
        </div>
        {data && (
          <span className="text-xs text-[#8b949e]">{data.total} total</span>
        )}
      </div>

      {/* Status filter */}
      <div className="flex items-center gap-2">
        {(['ALL', 'OPEN', 'RESOLVED'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              statusFilter === s
                ? 'bg-[#1f6feb]/20 border-[#1f6feb] text-[#58a6ff]'
                : 'border-[#30363d] text-[#8b949e] hover:text-[#c9d1d9]'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#30363d]">
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Error Code</th>
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Trigger Rule</th>
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Brand</th>
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Count</th>
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">First Seen</th>
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Last Seen</th>
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-[#30363d]/50">
                  {Array.from({ length: 7 }).map((__, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-white/5 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length ? (
              filtered.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-[#30363d]/50 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link href={`/errors/${r.id}`} className="text-[#58a6ff] hover:underline">
                      <code className="text-xs bg-white/5 px-1.5 py-0.5 rounded">{r.errorCode}</code>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-[#c9d1d9] text-xs max-w-xs truncate" title={r.triggerRule}>
                    {r.triggerRule}
                  </td>
                  <td className="px-4 py-3 text-[#8b949e] text-xs">{r.brandId ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-semibold ${
                        r.count >= 100 ? 'text-red-400' : r.count >= 10 ? 'text-orange-400' : 'text-[#c9d1d9]'
                      }`}
                    >
                      {r.count.toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#8b949e] text-xs">
                    {new Date(r.firstSeen).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                  </td>
                  <td className="px-4 py-3 text-[#8b949e] text-xs">
                    {new Date(r.lastSeen).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded border ${
                        STATUS_STYLES[r.status] ?? 'bg-gray-900/50 text-gray-400 border-gray-800'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-[#8b949e]">
                  <Bot className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  No auto-reports found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: Math.min(data.totalPages, 5) }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`text-xs px-3 py-1.5 rounded border transition-colors ${
                page === p
                  ? 'bg-[#1f6feb]/20 border-[#1f6feb] text-[#58a6ff]'
                  : 'border-[#30363d] text-[#8b949e] hover:text-[#c9d1d9]'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

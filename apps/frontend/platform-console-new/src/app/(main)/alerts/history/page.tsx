'use client';

import { useState, useCallback, useEffect } from 'react';
import { History } from 'lucide-react';
import { api } from '@/lib/api';
import Link from 'next/link';

type AlertHistoryEntry = {
  id: string;
  ruleName: string;
  errorCode: string;
  triggeredAt: string;
  channel: string;
  status: 'SENT' | 'FAILED' | 'SUPPRESSED';
};

type AlertHistoryResponse = {
  items: AlertHistoryEntry[];
  total: number;
  page: number;
  totalPages: number;
};

const STATUS_STYLES: Record<string, string> = {
  SENT: 'bg-green-900/40 text-green-400 border-green-800',
  FAILED: 'bg-red-900/40 text-red-400 border-red-800',
  SUPPRESSED: 'bg-gray-900/40 text-gray-400 border-gray-700',
};

export default function AlertHistoryPage() {
  const [data, setData] = useState<AlertHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = (await api.alerts.history({ page, limit: 25 })) as AlertHistoryResponse;
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#c9d1d9]">Alert History</h2>
          <p className="text-xs text-[#8b949e] mt-0.5">
            Log of all triggered alerts across all rules
          </p>
        </div>
        <div className="flex items-center gap-3">
          {data && (
            <span className="text-xs text-[#8b949e]">{data.total} total</span>
          )}
          <Link
            href="/alerts"
            className="text-xs text-[#58a6ff] hover:underline"
          >
            Manage Rules
          </Link>
        </div>
      </div>

      <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#30363d]">
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Rule Name</th>
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Error Code</th>
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Triggered At</th>
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Channel</th>
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-[#30363d]/50">
                  {Array.from({ length: 5 }).map((__, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-white/5 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data?.items?.length ? (
              data.items.map((entry) => (
                <tr
                  key={entry.id}
                  className="border-b border-[#30363d]/50 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-4 py-3 text-[#c9d1d9] text-xs font-medium">{entry.ruleName}</td>
                  <td className="px-4 py-3">
                    <code className="text-xs bg-white/5 px-1.5 py-0.5 rounded text-[#8b949e]">
                      {entry.errorCode}
                    </code>
                  </td>
                  <td className="px-4 py-3 text-[#8b949e] text-xs">
                    {new Date(entry.triggeredAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                  </td>
                  <td className="px-4 py-3 text-[#8b949e] text-xs font-mono">{entry.channel}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded border ${
                        STATUS_STYLES[entry.status] ?? 'bg-gray-900/50 text-gray-400 border-gray-800'
                      }`}
                    >
                      {entry.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-[#8b949e]">
                  <History className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  No alert history yet
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

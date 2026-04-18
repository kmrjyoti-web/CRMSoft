'use client';

import { useState, useEffect, useCallback } from 'react';
import { RotateCcw } from 'lucide-react';
import { api } from '@/lib/api';

type RollbackEntry = {
  id: string;
  fromVersion: string;
  toVersion: string;
  reason: string;
  rolledBackBy: string;
  rolledBackAt: string;
};

export default function RollbackHistoryPage() {
  const [rollbacks, setRollbacks] = useState<RollbackEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = (await api.versions.rollbacks()) as any;
      setRollbacks(Array.isArray(data) ? data : data.items ?? []);
    } catch {
      setRollbacks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-[#c9d1d9]">Rollback History</h2>
        <p className="text-xs text-[#8b949e] mt-0.5">
          Record of all version rollbacks performed on the platform
        </p>
      </div>

      <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#30363d]">
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">From Version</th>
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">To Version</th>
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Reason</th>
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Rolled Back By</th>
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Rolled Back At</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b border-[#30363d]/50">
                  {Array.from({ length: 5 }).map((__, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-white/5 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : rollbacks.length > 0 ? (
              rollbacks.map((rb) => (
                <tr
                  key={rb.id}
                  className="border-b border-[#30363d]/50 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-4 py-3 text-[#c9d1d9] font-mono">{rb.fromVersion}</td>
                  <td className="px-4 py-3 text-[#c9d1d9] font-mono">{rb.toVersion}</td>
                  <td className="px-4 py-3 text-[#c9d1d9] max-w-xs truncate">{rb.reason}</td>
                  <td className="px-4 py-3 text-[#8b949e] text-xs">{rb.rolledBackBy}</td>
                  <td className="px-4 py-3 text-[#8b949e] text-xs">
                    {new Date(rb.rolledBackAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-[#8b949e]">
                  <RotateCcw className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  No rollbacks recorded
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

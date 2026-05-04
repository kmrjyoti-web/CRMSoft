'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { CheckCircle2, XCircle, Loader2, AlertTriangle, History } from 'lucide-react';
import { api } from '@/lib/api';

type Execution = {
  id: string;
  status: string;
  triggerType: string;
  moduleScope: string | null;
  totalTests: number;
  passed: number;
  failed: number;
  duration: number | null;
  startedAt: string;
};

function StatusIcon({ status }: { status: string }) {
  if (status === 'PASSED') return <CheckCircle2 className="w-4 h-4 text-[#238636]" />;
  if (status === 'FAILED') return <XCircle className="w-4 h-4 text-[#da3633]" />;
  if (status === 'RUNNING') return <Loader2 className="w-4 h-4 text-[#d29922] animate-spin" />;
  return <AlertTriangle className="w-4 h-4 text-[#f85149]" />;
}

export default function ExecutionsPage() {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterTrigger, setFilterTrigger] = useState('');

  const fetchExecutions = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (filterStatus) params.status = filterStatus;
      if (filterTrigger) params.triggerType = filterTrigger;
      const result = (await api.tests.executions(Object.keys(params).length ? params : undefined)) as
        | { items?: Execution[] }
        | Execution[];
      setExecutions(Array.isArray(result) ? result : (result as any).items ?? []);
    } catch {
      setExecutions([]);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterTrigger]);

  useEffect(() => {
    fetchExecutions();
  }, [fetchExecutions]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-[#c9d1d9]">Test Executions</h2>
        <p className="text-xs text-[#8b949e] mt-0.5">History of all test runs</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-[#0d1117] border border-[#30363d] rounded-md text-sm text-[#c9d1d9] px-3 py-1.5 focus:outline-none focus:border-[#58a6ff]"
        >
          <option value="">All Statuses</option>
          <option value="RUNNING">Running</option>
          <option value="PASSED">Passed</option>
          <option value="FAILED">Failed</option>
          <option value="ERROR">Error</option>
        </select>
        <select
          value={filterTrigger}
          onChange={(e) => setFilterTrigger(e.target.value)}
          className="bg-[#0d1117] border border-[#30363d] rounded-md text-sm text-[#c9d1d9] px-3 py-1.5 focus:outline-none focus:border-[#58a6ff]"
        >
          <option value="">All Triggers</option>
          <option value="MANUAL">Manual</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="CI">CI</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#30363d]">
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Status</th>
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Trigger</th>
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Module Scope</th>
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Total</th>
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Passed</th>
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Failed</th>
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Duration</th>
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Started At</th>
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-[#30363d]/50">
                  {Array.from({ length: 9 }).map((__, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-white/5 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : executions.length > 0 ? (
              executions.map((exec) => (
                <tr
                  key={exec.id}
                  className="border-b border-[#30363d]/50 hover:bg-white/[0.02] transition-colors cursor-pointer"
                  onClick={() => (window.location.href = `/tests/executions/${exec.id}`)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <StatusIcon status={exec.status} />
                      <span className="text-xs text-[#c9d1d9]">{exec.status}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs bg-white/5 px-1.5 py-0.5 rounded text-[#8b949e]">
                      {exec.triggerType}
                    </code>
                  </td>
                  <td className="px-4 py-3 text-[#8b949e] text-xs">{exec.moduleScope ?? 'All'}</td>
                  <td className="px-4 py-3 text-[#c9d1d9] text-xs">{exec.totalTests}</td>
                  <td className="px-4 py-3 text-xs text-[#238636]">{exec.passed}</td>
                  <td className="px-4 py-3 text-xs text-[#da3633]">{exec.failed}</td>
                  <td className="px-4 py-3 text-[#8b949e] text-xs">
                    {exec.duration != null ? `${exec.duration}s` : '-'}
                  </td>
                  <td className="px-4 py-3 text-[#8b949e] text-xs">
                    {new Date(exec.startedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/tests/executions/${exec.id}`}
                      className="text-xs text-[#58a6ff] hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-[#8b949e]">
                  <History className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  No executions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { GitBranch, CheckCircle, XCircle, Clock } from 'lucide-react';
import { api } from '@/lib/api';

type Pipeline = {
  id: string;
  pipelineName: string;
  triggerType: string;
  branch: string;
  status: string;
  jobs: any[];
  startedAt: string;
  completedAt: string | null;
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  SUCCESS: <CheckCircle className="w-4 h-4 text-green-400" />,
  FAILED: <XCircle className="w-4 h-4 text-red-400" />,
  RUNNING: <Clock className="w-4 h-4 text-yellow-400 animate-pulse" />,
};

export default function PipelinesPage() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (filterStatus) params.status = filterStatus;
      const data = await api.cicd.pipelines(Object.keys(params).length ? params : undefined) as any;
      setPipelines(Array.isArray(data) ? data : data?.items ?? []);
    } catch {
      setPipelines([]);
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-[#161b22] border border-[#30363d] rounded-lg animate-pulse" />
        <div className="h-64 bg-[#161b22] border border-[#30363d] rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-[#c9d1d9]">Pipeline History</h2>
        <p className="text-xs text-[#8b949e] mt-0.5">CI/CD pipeline execution records</p>
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
          <option value="SUCCESS">Success</option>
          <option value="FAILED">Failed</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#30363d]">
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Status</th>
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Pipeline Name</th>
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Trigger</th>
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Branch</th>
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Jobs</th>
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Started At</th>
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Completed At</th>
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pipelines.length > 0 ? (
              pipelines.map((p) => (
                <tr key={p.id} className="border-b border-[#30363d]/50 hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    {STATUS_ICONS[p.status] ?? <Clock className="w-4 h-4 text-[#8b949e]" />}
                  </td>
                  <td className="px-4 py-3 text-[#c9d1d9]">{p.pipelineName}</td>
                  <td className="px-4 py-3">
                    <code className="text-xs bg-white/5 px-1.5 py-0.5 rounded text-[#8b949e]">{p.triggerType}</code>
                  </td>
                  <td className="px-4 py-3 text-[#8b949e] text-xs font-mono">{p.branch}</td>
                  <td className="px-4 py-3 text-[#8b949e] text-xs">{p.jobs?.length ?? 0}</td>
                  <td className="px-4 py-3 text-[#8b949e] text-xs">
                    {new Date(p.startedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                  </td>
                  <td className="px-4 py-3 text-[#8b949e] text-xs">
                    {p.completedAt ? new Date(p.completedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/cicd/pipelines/${p.id}`} className="text-xs text-[#58a6ff] hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-[#8b949e]">
                  <GitBranch className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  No pipeline runs found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';

type Incident = {
  id: string;
  title: string;
  severity: string;
  status: string;
  affectedService: string;
  startedAt: string;
  resolvedAt: string | null;
};

const SEVERITY_COLORS: Record<string, string> = {
  P1: 'bg-red-900/50 text-red-500 border-red-800',
  P2: 'bg-orange-900/50 text-orange-500 border-orange-800',
  P3: 'bg-yellow-900/50 text-yellow-500 border-yellow-800',
  P4: 'bg-gray-900/50 text-gray-400 border-gray-800',
};

const STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-red-900/50 text-red-400 border-red-800',
  INVESTIGATING: 'bg-orange-900/50 text-orange-400 border-orange-800',
  MITIGATED: 'bg-yellow-900/50 text-yellow-400 border-yellow-800',
  RESOLVED: 'bg-green-900/50 text-green-400 border-green-800',
};

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (filterStatus) params.status = filterStatus;
      if (filterSeverity) params.severity = filterSeverity;
      const data = await api.security.incidents(Object.keys(params).length ? params : undefined) as any;
      setIncidents(Array.isArray(data) ? data : data?.items ?? []);
    } catch {
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterSeverity]);

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#c9d1d9]">Security Incidents</h2>
          <p className="text-xs text-[#8b949e] mt-0.5">Track and manage security incidents</p>
        </div>
        <Link
          href="/security/incidents/new"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#238636] text-white rounded-md hover:bg-[#2ea043] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> New Incident
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-[#0d1117] border border-[#30363d] rounded-md text-sm text-[#c9d1d9] px-3 py-1.5 focus:outline-none focus:border-[#58a6ff]"
        >
          <option value="">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="INVESTIGATING">Investigating</option>
          <option value="MITIGATED">Mitigated</option>
          <option value="RESOLVED">Resolved</option>
        </select>
        <select
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
          className="bg-[#0d1117] border border-[#30363d] rounded-md text-sm text-[#c9d1d9] px-3 py-1.5 focus:outline-none focus:border-[#58a6ff]"
        >
          <option value="">All Severities</option>
          <option value="P1">P1</option>
          <option value="P2">P2</option>
          <option value="P3">P3</option>
          <option value="P4">P4</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#30363d]">
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Severity</th>
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Title</th>
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Service</th>
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Status</th>
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Started At</th>
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Resolved At</th>
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {incidents.length > 0 ? (
              incidents.map((inc) => (
                <tr key={inc.id} className="border-b border-[#30363d]/50 hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded border ${SEVERITY_COLORS[inc.severity] ?? SEVERITY_COLORS.P4}`}>
                      {inc.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#c9d1d9]">{inc.title}</td>
                  <td className="px-4 py-3 text-[#8b949e] text-xs">{inc.affectedService}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded border ${STATUS_COLORS[inc.status] ?? STATUS_COLORS.OPEN}`}>
                      {inc.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#8b949e] text-xs">
                    {new Date(inc.startedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                  </td>
                  <td className="px-4 py-3 text-[#8b949e] text-xs">
                    {inc.resolvedAt ? new Date(inc.resolvedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/security/incidents/${inc.id}`} className="text-xs text-[#58a6ff] hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-[#8b949e]">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  No incidents found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

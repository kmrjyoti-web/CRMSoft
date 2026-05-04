'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { TrendingUp, Users, IndianRupee, Clock, Filter, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';

type RevenueSummary = {
  partnerCode: string;
  totalTenants: number;
  paidTenants: number;
  totalRevenueInr: number;
  totalCommissionInr: number;
  pendingCommissionInr: number;
  thisMonthRevenueInr: number;
  thisMonthCommissionInr: number;
};

type CommissionLog = {
  id: string;
  partnerCode: string;
  childTenantId: string;
  paymentId: string;
  paymentAmountInr: number;
  commissionPct: number;
  commissionInr: number;
  planCode: string | null;
  status: string;
  createdAt: string;
};

function fmtInr(n: number): string {
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(2)}Cr`;
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(2)}L`;
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(1)}K`;
  return `₹${n.toFixed(2)}`;
}

function fmtFullInr(n: number): string {
  return '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'CREDITED') {
    return <span className="bg-[#238636]/20 text-[#3fb950] text-xs px-1.5 py-0.5 rounded font-mono">CREDITED</span>;
  }
  return <span className="bg-[#9e6a03]/20 text-[#e3b341] text-xs px-1.5 py-0.5 rounded font-mono">PENDING</span>;
}

export default function PartnerRevenuePage() {
  const params = useParams();
  const partnerCode = params.partnerCode as string;

  const [summary, setSummary] = useState<RevenueSummary | null>(null);
  const [logs, setLogs] = useState<CommissionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [fromFilter, setFromFilter] = useState('');
  const [toFilter, setToFilter] = useState('');

  const loadSummary = useCallback(async () => {
    try {
      const data = await api.pcConfig.commissionSummary(partnerCode) as RevenueSummary;
      setSummary(data);
    } catch {
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [partnerCode]);

  const loadLogs = useCallback(async () => {
    setLogsLoading(true);
    try {
      const data = await api.pcConfig.commissionLogs({
        partnerCode,
        status: statusFilter || undefined,
        from: fromFilter || undefined,
        to: toFilter || undefined,
      }) as CommissionLog[];
      setLogs(Array.isArray(data) ? data : []);
    } catch {
      setLogs([]);
    } finally {
      setLogsLoading(false);
    }
  }, [partnerCode, statusFilter, fromFilter, toFilter]);

  useEffect(() => { loadSummary(); }, [loadSummary]);
  useEffect(() => { loadLogs(); }, [loadLogs]);

  const statCards = summary ? [
    { label: 'Total Tenants', value: summary.totalTenants.toString(), sub: `${summary.paidTenants} paid`, icon: Users, color: '#58a6ff' },
    { label: 'Total Revenue', value: fmtInr(summary.totalRevenueInr), sub: `This month: ${fmtInr(summary.thisMonthRevenueInr)}`, icon: IndianRupee, color: '#3fb950' },
    { label: 'Total Commission', value: fmtInr(summary.totalCommissionInr), sub: `This month: ${fmtInr(summary.thisMonthCommissionInr)}`, icon: TrendingUp, color: '#d2a8ff' },
    { label: 'Pending Payout', value: fmtInr(summary.pendingCommissionInr), sub: 'Awaiting credit', icon: Clock, color: '#e3b341' },
  ] : [];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link
          href="/governance/partners"
          className="flex items-center gap-1 text-xs text-console-muted hover:text-console-text transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Partners
        </Link>
        <span className="text-console-muted/40">›</span>
        <span className="font-mono text-xs bg-[#30363d] text-[#58a6ff] px-1.5 py-0.5 rounded">{partnerCode}</span>
        <span className="text-xs text-console-muted">Revenue Dashboard</span>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-console-sidebar border border-console-border rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-3">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="bg-console-sidebar border border-console-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-console-muted">{card.label}</p>
                  <Icon className="w-3.5 h-3.5" style={{ color: card.color }} />
                </div>
                <p className="text-xl font-semibold text-console-text font-mono">{card.value}</p>
                <p className="text-xs text-console-muted mt-1">{card.sub}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Log Table */}
      <div className="bg-console-sidebar border border-console-border rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-console-border">
          <p className="text-xs font-semibold text-console-text">Commission Log</p>
          <div className="flex items-center gap-2">
            <Filter className="w-3 h-3 text-console-muted" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-[#0d1117] border border-console-border rounded px-2 py-1 text-console-text focus:outline-none focus:border-[#58a6ff]"
            >
              <option value="">All status</option>
              <option value="PENDING">PENDING</option>
              <option value="CREDITED">CREDITED</option>
            </select>
            <input
              type="date"
              value={fromFilter}
              onChange={(e) => setFromFilter(e.target.value)}
              className="text-xs bg-[#0d1117] border border-console-border rounded px-2 py-1 text-console-text focus:outline-none focus:border-[#58a6ff]"
            />
            <span className="text-console-muted text-xs">–</span>
            <input
              type="date"
              value={toFilter}
              onChange={(e) => setToFilter(e.target.value)}
              className="text-xs bg-[#0d1117] border border-console-border rounded px-2 py-1 text-console-text focus:outline-none focus:border-[#58a6ff]"
            />
          </div>
        </div>

        {logsLoading ? (
          <div className="space-y-px">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 bg-console-sidebar animate-pulse border-b border-console-border" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-console-muted opacity-30" />
            <p className="text-xs text-console-muted">No commission records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-console-border">
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-console-muted whitespace-nowrap">Date</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-console-muted whitespace-nowrap">Tenant ID</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-console-muted">Plan</th>
                  <th className="text-right px-4 py-2.5 text-xs font-medium text-console-muted whitespace-nowrap">Payment</th>
                  <th className="text-right px-4 py-2.5 text-xs font-medium text-console-muted whitespace-nowrap">Comm %</th>
                  <th className="text-right px-4 py-2.5 text-xs font-medium text-console-muted whitespace-nowrap">Commission</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-console-muted">Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => (
                  <tr key={log.id} className={i < logs.length - 1 ? 'border-b border-console-border' : ''}>
                    <td className="px-4 py-3 text-console-muted whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-console-muted text-xs">{log.childTenantId.slice(0, 8)}…</span>
                    </td>
                    <td className="px-4 py-3">
                      {log.planCode ? (
                        <span className="font-mono bg-[#30363d] text-[#58a6ff] px-1.5 py-0.5 rounded text-xs">{log.planCode}</span>
                      ) : (
                        <span className="text-console-muted/40">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-console-text font-mono">
                      {fmtFullInr(Number(log.paymentAmountInr))}
                    </td>
                    <td className="px-4 py-3 text-right text-console-muted font-mono">
                      {Number(log.commissionPct).toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 text-right font-mono" style={{ color: '#d2a8ff' }}>
                      {fmtFullInr(Number(log.commissionInr))}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={log.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

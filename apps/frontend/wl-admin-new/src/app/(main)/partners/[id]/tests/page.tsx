'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { FlaskConical, Play, Filter } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const token = typeof window !== 'undefined' ? localStorage.getItem('wl_admin_token') || '' : '';
const BASE = 'http://localhost:3010/api/v1/wl';
const apiFetch = (url: string, opts?: RequestInit) =>
  fetch(url, { ...opts, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(opts?.headers || {}) } }).then((r) => r.json());

const TABS = (id: string) => [
  { label: 'Overview', href: `/partners/${id}` },
  { label: 'Branding', href: `/partners/${id}/branding` },
  { label: 'Domains', href: `/partners/${id}/domains` },
  { label: 'Pricing', href: `/partners/${id}/pricing` },
  { label: 'Provisioning', href: `/partners/${id}/provisioning` },
  { label: 'Git', href: `/partners/${id}/git` },
  { label: 'Deployments', href: `/partners/${id}/deployments` },
  { label: 'Errors', href: `/partners/${id}/errors` },
  { label: 'Tests', href: `/partners/${id}/tests` },
  { label: 'Dev Requests', href: `/partners/${id}/dev-requests` },
  { label: 'Usage', href: `/partners/${id}/usage` },
  { label: 'Billing', href: `/partners/${id}/billing` },
];

const TEST_TYPES = ['ALL', 'UNIT', 'FUNCTIONAL', 'SMOKE', 'INTEGRATION'];

function rowColor(passRate: number): string {
  if (passRate >= 90) return 'border-green-800/40 bg-green-950/10';
  if (passRate >= 70) return 'border-yellow-800/40 bg-yellow-950/10';
  return 'border-red-800/40 bg-red-950/10';
}

function passRateColor(rate: number): string {
  if (rate >= 90) return 'text-green-400';
  if (rate >= 70) return 'text-yellow-400';
  return 'text-red-400';
}

export default function TestsPage() {
  const { id } = useParams() as { id: string };
  const qc = useQueryClient();
  const [typeFilter, setTypeFilter] = useState('ALL');

  const { data: results = [], isLoading } = useQuery({
    queryKey: ['tests', id],
    queryFn: () => apiFetch(`${BASE}/tests/partner/${id}`).then((r) => r?.results ?? r ?? []),
  });

  const triggerMutation = useMutation({
    mutationFn: () => apiFetch(`${BASE}/tests/partner/${id}/trigger`, { method: 'POST' }),
    onSuccess: () => { toast.success('Test triggered — results will appear shortly'); qc.invalidateQueries({ queryKey: ['tests', id] }); },
    onError: () => toast.error('Failed to trigger tests'),
  });

  const filtered = (results as any[]).filter(
    (r: any) => typeFilter === 'ALL' || r.testType === typeFilter
  );

  const totalTests = filtered.reduce((sum: number, r: any) => sum + (r.total ?? 0), 0);
  const totalPassed = filtered.reduce((sum: number, r: any) => sum + (r.passed ?? 0), 0);
  const overallPassRate = totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0;

  if (isLoading) return <div className="text-gray-400">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <FlaskConical className="w-6 h-6 text-blue-400" /> Test Results
        </h1>
        <button
          onClick={() => triggerMutation.mutate()}
          disabled={triggerMutation.isPending}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition flex items-center gap-2 disabled:opacity-50"
        >
          <Play className={`w-4 h-4 ${triggerMutation.isPending ? 'animate-pulse' : ''}`} />
          {triggerMutation.isPending ? 'Triggering...' : 'Trigger Test'}
        </button>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS(id).map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            className={`px-3 py-1.5 text-xs rounded-lg transition ${label === 'Tests' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Overall Pass Rate */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6 flex items-center gap-6">
        <div className="text-center">
          <div className={`text-5xl font-bold ${passRateColor(overallPassRate)}`}>{overallPassRate}%</div>
          <div className="text-gray-400 text-sm mt-1">Overall Pass Rate</div>
        </div>
        <div className="flex-1 grid grid-cols-3 gap-4">
          <div className="bg-gray-800 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-white">{totalTests}</div>
            <div className="text-xs text-gray-400">Total Tests</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-green-400">{totalPassed}</div>
            <div className="text-xs text-gray-400">Passed</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-red-400">{totalTests - totalPassed}</div>
            <div className="text-xs text-gray-400">Failed</div>
          </div>
        </div>
      </div>

      {/* Type Filter */}
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-4 h-4 text-gray-400" />
        {TEST_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-3 py-1.5 text-xs rounded-lg transition font-medium ${
              typeFilter === t ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Timestamp</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Test Suite</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Type</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Total</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Passed</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Failed</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Pass Rate</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">No test results found</td></tr>
            ) : (
              filtered.map((result: any) => {
                const rate = result.total > 0 ? Math.round((result.passed / result.total) * 100) : 0;
                return (
                  <tr key={result.id} className={`border-b ${rowColor(rate)}`}>
                    <td className="px-4 py-3 text-gray-400 text-xs">{result.timestamp ? new Date(result.timestamp).toLocaleString() : '—'}</td>
                    <td className="px-4 py-3 text-white text-xs">{result.testSuite ?? '—'}</td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 bg-gray-700 text-gray-300 rounded text-xs">{result.testType}</span></td>
                    <td className="px-4 py-3 text-gray-300">{result.total ?? 0}</td>
                    <td className="px-4 py-3 text-green-400">{result.passed ?? 0}</td>
                    <td className="px-4 py-3 text-red-400">{result.failed ?? (result.total ?? 0) - (result.passed ?? 0)}</td>
                    <td className="px-4 py-3"><span className={`font-bold ${passRateColor(rate)}`}>{rate}%</span></td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        result.status === 'PASSED' ? 'bg-green-500/20 text-green-400' :
                        result.status === 'FAILED' ? 'bg-red-500/20 text-red-400' :
                        'bg-gray-600/40 text-gray-400'
                      }`}>
                        {result.status ?? (rate >= 70 ? 'PASSED' : 'FAILED')}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

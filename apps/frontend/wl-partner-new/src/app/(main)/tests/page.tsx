'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FlaskConical, Play, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const token =
  typeof window !== 'undefined' ? localStorage.getItem('wl_partner_token') || '' : '';
const partnerId =
  typeof window !== 'undefined' ? localStorage.getItem('wl_partner_id') || '' : '';
const BASE = 'http://localhost:3010/api/v1/wl';

const apiFetch = (url: string, opts?: RequestInit) =>
  fetch(url, {
    ...opts,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(opts?.headers || {}),
    },
  }).then((r) => r.json());

function passRateColor(rate: number) {
  if (rate >= 90) return 'text-green-400';
  if (rate >= 70) return 'text-yellow-400';
  return 'text-red-400';
}

function passRateBg(rate: number) {
  if (rate >= 90) return 'bg-green-900 text-green-300';
  if (rate >= 70) return 'bg-yellow-900 text-yellow-300';
  return 'bg-red-900 text-red-300';
}

function statusBadge(status: string) {
  switch (status) {
    case 'PASSED':
      return 'bg-green-900 text-green-300';
    case 'FAILED':
      return 'bg-red-900 text-red-300';
    case 'RUNNING':
      return 'bg-blue-900 text-blue-300';
    default:
      return 'bg-gray-800 text-gray-400';
  }
}

function formatDate(ts: string) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function TestResultsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['partner-tests', partnerId],
    queryFn: () => apiFetch(`${BASE}/tests/partner/${partnerId}`),
    enabled: !!partnerId,
  });

  const triggerMutation = useMutation({
    mutationFn: () =>
      apiFetch(`${BASE}/tests/partner/${partnerId}/trigger`, { method: 'POST', body: '{}' }),
    onSuccess: () => {
      toast.success('Test run requested');
      queryClient.invalidateQueries({ queryKey: ['partner-tests', partnerId] });
    },
    onError: () => toast.error('Failed to trigger test run'),
  });

  const runs: any[] = data?.runs || data || [];

  // Calculate overall pass rate from all results
  let totalPassed = 0;
  let totalTests = 0;
  runs.forEach((r: any) => {
    totalPassed += Number(r.passed || 0);
    totalTests += Number(r.total || 0);
  });
  const overallRate = totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Test Results</h1>
          <p className="text-sm text-gray-400 mt-1">Automated test runs for your platform</p>
        </div>
        <button
          onClick={() => triggerMutation.mutate()}
          disabled={triggerMutation.isPending}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 rounded-lg text-sm font-medium text-white transition"
        >
          <Play size={15} />
          {triggerMutation.isPending ? 'Requesting…' : 'Request Test Run'}
        </button>
      </div>

      {/* Overall Pass Rate Banner */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8 flex items-center gap-6">
        <div>
          <div className="text-sm text-gray-400 mb-1">Overall Pass Rate</div>
          <div className={`text-5xl font-extrabold ${passRateColor(overallRate)}`}>
            {overallRate}%
          </div>
        </div>
        <div className="flex-1 bg-gray-800 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all ${
              overallRate >= 90
                ? 'bg-green-500'
                : overallRate >= 70
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${overallRate}%` }}
          />
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-400">Total Runs</div>
          <div className="text-2xl font-bold text-white">{runs.length}</div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-400">Tests Passed</div>
          <div className="text-2xl font-bold text-white">
            {totalPassed} / {totalTests}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-gray-800">
            <tr>
              {['Date', 'Test Suite', 'Passed / Total', 'Pass Rate', 'Status'].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-500">
                  Loading…
                </td>
              </tr>
            ) : runs.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-500">
                  <FlaskConical size={24} className="mx-auto mb-2 text-gray-600" />
                  No test runs yet
                </td>
              </tr>
            ) : (
              runs.map((run: any) => {
                const rate =
                  run.total > 0 ? Math.round((run.passed / run.total) * 100) : 0;
                return (
                  <tr key={run.id} className="border-b border-gray-800 last:border-0">
                    <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                      {formatDate(run.createdAt || run.runAt)}
                    </td>
                    <td className="px-4 py-3 text-sm text-white">{run.suiteName || run.suite || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      <span className="text-green-400 font-medium">{run.passed ?? '—'}</span>
                      <span className="text-gray-600 mx-1">/</span>
                      <span>{run.total ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-semibold ${passRateBg(rate)}`}
                      >
                        {rate}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${statusBadge(run.status)}`}
                      >
                        {run.status === 'PASSED' && <CheckCircle size={11} />}
                        {run.status === 'FAILED' && <XCircle size={11} />}
                        {run.status}
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

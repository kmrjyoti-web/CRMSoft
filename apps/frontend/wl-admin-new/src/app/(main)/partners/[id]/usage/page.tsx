'use client';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { BarChart3, Calendar } from 'lucide-react';
import Link from 'next/link';

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

type DateRange = 'this_month' | 'last_month' | 'custom';

function fmt(n: number | undefined): string {
  if (n == null) return '—';
  return n.toLocaleString();
}

function fmtCurrency(n: number | undefined): string {
  if (n == null) return '—';
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function UsagePage() {
  const { id } = useParams() as { id: string };
  const [dateRange, setDateRange] = useState<DateRange>('this_month');
  const [customMonth, setCustomMonth] = useState('');

  const { data: usage, isLoading } = useQuery({
    queryKey: ['usage', id, dateRange, customMonth],
    queryFn: () => {
      const params = new URLSearchParams({ range: dateRange });
      if (dateRange === 'custom' && customMonth) params.set('month', customMonth);
      return apiFetch(`${BASE}/billing/partner/${id}/usage?${params}`);
    },
  });

  const summary = usage?.summary ?? {};
  const services: any[] = usage?.services ?? usage?.breakdown ?? [];
  const totalCost = services.reduce((sum: number, s: any) => sum + (s.totalCost ?? 0), 0);

  if (isLoading) return <div className="text-gray-400">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-blue-400" /> Usage Analytics
        </h1>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS(id).map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            className={`px-3 py-1.5 text-xs rounded-lg transition ${label === 'Usage' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Date Range Filter */}
      <div className="flex items-center gap-3 mb-6">
        <Calendar className="w-4 h-4 text-gray-400" />
        {(['this_month', 'last_month', 'custom'] as DateRange[]).map((r) => (
          <button
            key={r}
            onClick={() => setDateRange(r)}
            className={`px-3 py-1.5 text-xs rounded-lg transition font-medium capitalize ${
              dateRange === r ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {r.replace('_', ' ')}
          </button>
        ))}
        {dateRange === 'custom' && (
          <input
            type="month"
            value={customMonth}
            onChange={(e) => setCustomMonth(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Events', value: fmt(summary.totalEvents), sub: 'This period' },
          { label: 'API Calls', value: fmt(summary.apiCalls), sub: 'This period' },
          { label: 'Storage', value: summary.storageGb != null ? `${summary.storageGb} GB` : '—', sub: 'Used' },
          { label: 'AI Tokens', value: fmt(summary.aiTokens), sub: 'Consumed' },
        ].map(({ label, value, sub }) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="text-xs text-gray-500 mb-1">{label}</div>
            <div className="text-xl font-bold text-white">{value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      {/* Service Breakdown Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-800">
          <h2 className="text-sm font-semibold text-white">Usage by Service</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Service Code</th>
              <th className="text-right px-4 py-3 text-gray-400 font-medium">Events Count</th>
              <th className="text-right px-4 py-3 text-gray-400 font-medium">Total Units</th>
              <th className="text-right px-4 py-3 text-gray-400 font-medium">Unit Price</th>
              <th className="text-right px-4 py-3 text-gray-400 font-medium">Total Cost</th>
            </tr>
          </thead>
          <tbody>
            {services.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No usage data for this period</td></tr>
            ) : (
              services.map((svc: any, idx: number) => (
                <tr key={svc.serviceCode ?? idx} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="px-4 py-3 text-white font-mono text-xs">{svc.serviceCode ?? svc.service ?? '—'}</td>
                  <td className="px-4 py-3 text-right text-gray-300">{fmt(svc.eventsCount ?? svc.events)}</td>
                  <td className="px-4 py-3 text-right text-gray-300">{fmt(svc.totalUnits ?? svc.units)}</td>
                  <td className="px-4 py-3 text-right text-gray-300">{fmtCurrency(svc.unitPrice)}</td>
                  <td className="px-4 py-3 text-right text-white font-medium">{fmtCurrency(svc.totalCost)}</td>
                </tr>
              ))
            )}
          </tbody>
          {services.length > 0 && (
            <tfoot>
              <tr className="border-t border-gray-700 bg-gray-800/50">
                <td colSpan={4} className="px-4 py-3 text-right text-gray-300 font-semibold text-sm">Total Cost</td>
                <td className="px-4 py-3 text-right text-white font-bold text-base">{fmtCurrency(totalCost)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}

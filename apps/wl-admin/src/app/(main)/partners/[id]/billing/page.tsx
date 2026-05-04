'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { Receipt, Plus, Send, CreditCard, X, DollarSign } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const token = typeof window !== 'undefined' ? localStorage.getItem('wl_admin_token') || '' : '';
const BASE = process.env.NEXT_PUBLIC_WL_API_URL || '/api/v1/wl';
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

const STATUS_CONFIG: Record<string, string> = {
  PAID: 'bg-green-500/20 text-green-400 border border-green-500/30',
  SENT: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  DRAFT: 'bg-gray-600/40 text-gray-400 border border-gray-600/50',
};

const GST_RATE = 0.18;

function fmtCurrency(n: number | undefined): string {
  if (n == null) return '—';
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function BillingPage() {
  const { id } = useParams() as { id: string };
  const qc = useQueryClient();
  const [payTarget, setPayTarget] = useState<any>(null);
  const [transactionRef, setTransactionRef] = useState('');

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['billing-invoices', id],
    queryFn: () => apiFetch(`${BASE}/billing/partner/${id}/invoices`).then((r) => r?.invoices ?? r ?? []),
  });

  const generateMutation = useMutation({
    mutationFn: () => apiFetch(`${BASE}/billing/partner/${id}/invoice`, { method: 'POST' }),
    onSuccess: () => { toast.success('Invoice generated'); qc.invalidateQueries({ queryKey: ['billing-invoices', id] }); },
    onError: () => toast.error('Failed to generate invoice'),
  });

  const sendMutation = useMutation({
    mutationFn: (invoiceId: string) => apiFetch(`${BASE}/billing/invoice/${invoiceId}/send`, { method: 'POST' }),
    onSuccess: () => { toast.success('Invoice sent'); qc.invalidateQueries({ queryKey: ['billing-invoices', id] }); },
    onError: () => toast.error('Failed to send invoice'),
  });

  const payMutation = useMutation({
    mutationFn: ({ invoiceId, ref }: { invoiceId: string; ref: string }) =>
      apiFetch(`${BASE}/billing/invoice/${invoiceId}/pay`, { method: 'POST', body: JSON.stringify({ transactionRef: ref }) }),
    onSuccess: () => {
      toast.success('Invoice marked as paid');
      setPayTarget(null);
      setTransactionRef('');
      qc.invalidateQueries({ queryKey: ['billing-invoices', id] });
    },
    onError: () => toast.error('Failed to mark as paid'),
  });

  const paidInvoices = (invoices as any[]).filter((inv: any) => inv.status === 'PAID');
  const totalRevenue = paidInvoices.reduce((sum: number, inv: any) => sum + (inv.totalAmount ?? inv.total ?? 0), 0);

  if (isLoading) return <div className="text-gray-400">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Receipt className="w-6 h-6 text-blue-400" /> Billing & Invoices
        </h1>
        <button
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition flex items-center gap-2 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" /> {generateMutation.isPending ? 'Generating...' : 'Generate Invoice'}
        </button>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS(id).map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            className={`px-3 py-1.5 text-xs rounded-lg transition ${label === 'Billing' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Revenue Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Revenue', value: fmtCurrency(totalRevenue), icon: <DollarSign className="w-4 h-4 text-green-400" /> },
          { label: 'Total Invoices', value: String((invoices as any[]).length), icon: <Receipt className="w-4 h-4 text-blue-400" /> },
          { label: 'Paid', value: String(paidInvoices.length), icon: <CreditCard className="w-4 h-4 text-green-400" /> },
          {
            label: 'Pending',
            value: String((invoices as any[]).filter((inv: any) => inv.status !== 'PAID').length),
            icon: <Send className="w-4 h-4 text-yellow-400" />,
          },
        ].map(({ label, value, icon }) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500">{label}</span>
              {icon}
            </div>
            <div className="text-xl font-bold text-white">{value}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Invoice #</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Period</th>
              <th className="text-right px-4 py-3 text-gray-400 font-medium">Subtotal</th>
              <th className="text-right px-4 py-3 text-gray-400 font-medium">GST (18%)</th>
              <th className="text-right px-4 py-3 text-gray-400 font-medium">Total</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Status</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(invoices as any[]).length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No invoices generated yet</td></tr>
            ) : (
              (invoices as any[]).map((inv: any) => {
                const subtotal = inv.subtotal ?? inv.amount ?? 0;
                const gst = inv.gst ?? inv.tax ?? subtotal * GST_RATE;
                const total = inv.totalAmount ?? inv.total ?? subtotal + gst;
                return (
                  <tr key={inv.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="px-4 py-3 text-white font-mono text-xs">{inv.invoiceNumber ?? inv.invoiceNo ?? inv.id?.slice(0, 8)}</td>
                    <td className="px-4 py-3 text-gray-300 text-xs">{inv.period ?? inv.billingPeriod ?? '—'}</td>
                    <td className="px-4 py-3 text-right text-gray-300">{fmtCurrency(subtotal)}</td>
                    <td className="px-4 py-3 text-right text-gray-400">{fmtCurrency(gst)}</td>
                    <td className="px-4 py-3 text-right text-white font-medium">{fmtCurrency(total)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CONFIG[inv.status] ?? 'bg-gray-700 text-gray-300'}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {inv.status === 'DRAFT' && (
                          <button
                            onClick={() => sendMutation.mutate(inv.id)}
                            disabled={sendMutation.isPending}
                            className="flex items-center gap-1 px-2 py-1 bg-blue-900/40 hover:bg-blue-800/60 text-blue-400 text-xs rounded transition"
                          >
                            <Send className="w-3 h-3" /> Send
                          </button>
                        )}
                        {inv.status === 'SENT' && (
                          <button
                            onClick={() => { setPayTarget(inv); setTransactionRef(''); }}
                            className="flex items-center gap-1 px-2 py-1 bg-green-900/40 hover:bg-green-800/60 text-green-400 text-xs rounded transition"
                          >
                            <CreditCard className="w-3 h-3" /> Mark Paid
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mark Paid Modal */}
      {payTarget && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Mark Invoice as Paid</h2>
              <button onClick={() => setPayTarget(null)}><X className="w-5 h-5 text-gray-400 hover:text-white" /></button>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Invoice: <span className="text-white font-mono">{payTarget.invoiceNumber ?? payTarget.id?.slice(0, 8)}</span>
            </p>
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-1">Transaction Reference</label>
              <input
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                placeholder="UTR / Transaction ID"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setPayTarget(null)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition">Cancel</button>
              <button
                disabled={!transactionRef || payMutation.isPending}
                onClick={() => payMutation.mutate({ invoiceId: payTarget.id, ref: transactionRef })}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition disabled:opacity-40"
              >
                {payMutation.isPending ? 'Marking...' : 'Confirm Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

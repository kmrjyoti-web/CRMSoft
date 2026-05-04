'use client';
import { useQuery } from '@tanstack/react-query';
import { FileText, Download, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

const token =
  typeof window !== 'undefined' ? localStorage.getItem('wl_partner_token') || '' : '';
const partnerId =
  typeof window !== 'undefined' ? localStorage.getItem('wl_partner_id') || '' : '';
const BASE = process.env.NEXT_PUBLIC_WL_API_URL || '/api/v1/wl';

const apiFetch = (url: string, opts?: RequestInit) =>
  fetch(url, {
    ...opts,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(opts?.headers || {}),
    },
  }).then((r) => r.json());

const GST_RATE = 0.18;

function formatINR(amount: number | string) {
  const n = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(n)) return '₹0';
  return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(ts: string) {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

const statusBadge: Record<string, string> = {
  PAID: 'bg-green-900 text-green-300',
  SENT: 'bg-blue-900 text-blue-300',
  DRAFT: 'bg-gray-800 text-gray-400',
  OVERDUE: 'bg-red-900 text-red-300',
};

export default function BillingPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['partner-billing-invoices', partnerId],
    queryFn: () => apiFetch(`${BASE}/billing/partner/${partnerId}/invoices`),
    enabled: !!partnerId,
  });

  const invoices: any[] = data?.invoices || data || [];

  // Summary calculations
  const now = new Date();
  const currentMonth = invoices.find(
    (inv: any) => {
      const d = new Date(inv.periodEnd || inv.createdAt);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }
  );
  const currentMonthUsage = currentMonth ? parseFloat(currentMonth.amount || 0) : 0;

  const lastInvoice = invoices.length > 0 ? invoices[0] : null;
  const outstanding = invoices
    .filter((inv: any) => inv.status === 'SENT' || inv.status === 'OVERDUE')
    .reduce((sum: number, inv: any) => sum + parseFloat(inv.totalAmount || inv.amount || 0), 0);
  const totalPaid = invoices
    .filter((inv: any) => inv.status === 'PAID')
    .reduce((sum: number, inv: any) => sum + parseFloat(inv.totalAmount || inv.amount || 0), 0);

  const summaryCards = [
    {
      label: 'Current Month Usage',
      value: formatINR(currentMonthUsage),
      color: 'blue',
    },
    {
      label: 'Last Invoice',
      value: lastInvoice
        ? formatINR(lastInvoice.totalAmount || lastInvoice.amount || 0)
        : '₹0',
      color: 'gray',
    },
    { label: 'Outstanding', value: formatINR(outstanding), color: 'yellow' },
    { label: 'Total Paid', value: formatINR(totalPaid), color: 'green' },
  ];

  const colorMap: Record<string, string> = {
    blue: 'text-blue-400',
    gray: 'text-gray-400',
    yellow: 'text-yellow-400',
    green: 'text-green-400',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Billing &amp; Invoices</h1>
          <p className="text-sm text-gray-400 mt-1">Invoice history and payment summary</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {summaryCards.map(({ label, value, color }) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="text-sm text-gray-400 mb-2">{label}</div>
            <div className={`text-2xl font-bold ${colorMap[color]}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-gray-800">
            <tr>
              {[
                'Invoice #',
                'Billing Period',
                'Amount',
                'GST (18%)',
                'Total',
                'Status',
                'Actions',
              ].map((h) => (
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
                <td colSpan={7} className="text-center py-10 text-gray-500">
                  Loading…
                </td>
              </tr>
            ) : invoices.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-500">
                  <FileText size={24} className="mx-auto mb-2 text-gray-600" />
                  No invoices yet
                </td>
              </tr>
            ) : (
              invoices.map((inv: any) => {
                const subtotal = parseFloat(inv.amount || 0);
                const gst = subtotal * GST_RATE;
                const total = parseFloat(inv.totalAmount || inv.amount || 0);

                return (
                  <tr key={inv.id} className="border-b border-gray-800 last:border-0">
                    <td className="px-4 py-3 text-sm font-mono text-white">
                      {inv.invoiceNumber || inv.id?.slice(0, 8)}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                      {formatDate(inv.periodStart)} – {formatDate(inv.periodEnd)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">{formatINR(subtotal)}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">{formatINR(gst)}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-white">
                      {formatINR(total)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          statusBadge[inv.status] || 'bg-gray-800 text-gray-400'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/billing/${inv.id}`}
                          className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition"
                        >
                          <ExternalLink size={12} />
                          View
                        </Link>
                        <button
                          onClick={() => toast('PDF download coming soon', { icon: '📄' })}
                          className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-white transition"
                        >
                          <Download size={12} />
                          PDF
                        </button>
                      </div>
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

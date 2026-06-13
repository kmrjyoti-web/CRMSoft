'use client';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Download, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

const token =
  typeof window !== 'undefined' ? localStorage.getItem('wl_partner_token') || '' : '';
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

const GST_RATE = 0.18;

function formatINR(amount: number | string) {
  const n = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(n)) return '₹0.00';
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

function formatDateTime(ts: string) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const statusBadge: Record<string, string> = {
  PAID: 'bg-green-900 text-green-300',
  SENT: 'bg-blue-900 text-blue-300',
  DRAFT: 'bg-gray-800 text-gray-400',
  OVERDUE: 'bg-red-900 text-red-300',
};

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;

  const { data, isLoading } = useQuery({
    queryKey: ['invoice-detail', id],
    queryFn: () => apiFetch(`${BASE}/billing/invoice/${id}`),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={28} className="text-blue-400 animate-spin" />
      </div>
    );
  }

  const inv: any = data?.invoice || data;

  if (!inv) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p>Invoice not found.</p>
        <Link
          href="/billing"
          className="text-blue-400 hover:text-blue-300 text-sm mt-2 inline-block"
        >
          ← Back to Billing
        </Link>
      </div>
    );
  }

  const lineItems: any[] = inv.lineItems || inv.items || [];
  const subtotal = lineItems.length > 0
    ? lineItems.reduce((s: number, item: any) => s + parseFloat(item.amount || item.total || 0), 0)
    : parseFloat(inv.amount || 0);
  const gst = subtotal * GST_RATE;
  const total = parseFloat(inv.totalAmount || inv.total || subtotal + gst);

  return (
    <div>
      {/* Back link */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/billing"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition"
        >
          <ArrowLeft size={15} />
          Back to Billing
        </Link>
        <button
          onClick={() => toast('PDF download coming soon', { icon: '📄' })}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 hover:text-white transition"
        >
          <Download size={15} />
          Download PDF
        </button>
      </div>

      <div className="max-w-3xl mx-auto space-y-5">
        {/* Invoice Header Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Invoice</div>
              <div className="text-2xl font-bold font-mono text-white">
                {inv.invoiceNumber || `INV-${id.slice(0, 8).toUpperCase()}`}
              </div>
            </div>
            <span
              className={`text-sm px-3 py-1 rounded-full font-medium ${
                statusBadge[inv.status] || 'bg-gray-800 text-gray-400'
              }`}
            >
              {inv.status}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-xs text-gray-500 mb-0.5">Billing Period</div>
              <div className="text-gray-300">
                {formatDate(inv.periodStart)} – {formatDate(inv.periodEnd)}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-0.5">Issue Date</div>
              <div className="text-gray-300">{formatDate(inv.issuedAt || inv.createdAt)}</div>
            </div>
            {inv.dueDate && (
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Due Date</div>
                <div className="text-gray-300">{formatDate(inv.dueDate)}</div>
              </div>
            )}
          </div>
        </div>

        {/* Line Items Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
              Line Items
            </h2>
          </div>
          <table className="w-full">
            <thead className="border-b border-gray-800">
              <tr>
                {['Service Code', 'Description', 'Units', 'Unit Price', 'Amount'].map((h) => (
                  <th
                    key={h}
                    className={`py-3 px-4 text-xs font-medium text-gray-500 uppercase ${
                      h === 'Unit Price' || h === 'Amount' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lineItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-600 text-sm">
                    No line items available
                  </td>
                </tr>
              ) : (
                lineItems.map((item: any, idx: number) => {
                  const lineAmount = parseFloat(item.amount || item.total || 0);
                  const unitPrice = parseFloat(item.unitPrice || item.price || 0);
                  const units = parseFloat(item.units || item.quantity || 1);
                  return (
                    <tr key={idx} className="border-b border-gray-800 last:border-0">
                      <td className="px-4 py-3 text-xs font-mono text-gray-400">
                        {item.serviceCode || item.code || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-white">{item.description || '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">{units}</td>
                      <td className="px-4 py-3 text-sm text-gray-300 text-right">
                        {formatINR(unitPrice)}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-white text-right">
                        {formatINR(lineAmount)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* Summary section */}
          <div className="border-t border-gray-800 px-5 py-4">
            <div className="flex flex-col items-end gap-2 text-sm">
              <div className="flex justify-between w-56">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-white font-medium">{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between w-56">
                <span className="text-gray-400">GST (18%)</span>
                <span className="text-white font-medium">{formatINR(gst)}</span>
              </div>
              <div className="flex justify-between w-56 pt-2 border-t border-gray-700">
                <span className="text-white font-semibold">Total</span>
                <span className="text-white font-bold text-lg">{formatINR(total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Info Card (shown only if PAID) */}
        {inv.status === 'PAID' && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Payment Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Payment Method</div>
                <div className="text-gray-300">{inv.paymentMethod || '—'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Transaction Ref</div>
                <div className="text-gray-300 font-mono">{inv.transactionRef || '—'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Paid At</div>
                <div className="text-gray-300">{formatDateTime(inv.paidAt)}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Icon, Badge } from '@/components/ui';
import { useSaleOrderList, useDeliveryChallanList, useSaleReturnList, useCreditNoteList } from '../hooks/useSales';

// ── Status color helpers ──────────────────────────────────────────────

const ORDER_STATUS_VARIANT: Record<string, 'success' | 'warning' | 'danger' | 'secondary' | 'primary'> = {
  APPROVED: 'success', PENDING: 'warning', CANCELLED: 'danger',
  DRAFT: 'secondary', PARTIALLY_DELIVERED: 'primary', DELIVERED: 'success',
};

// ── Nav links config ──────────────────────────────────────────────────

const NAV_LINKS = [
  { label: 'Orders',       href: '/sales/orders',           icon: 'shopping-cart' },
  { label: 'Challans',     href: '/sales/delivery-challans', icon: 'truck' },
  { label: 'Returns',      href: '/sales/returns',          icon: 'undo-2' },
  { label: 'Credit Notes', href: '/sales/credit-notes',     icon: 'file-minus' },
] as const;

// ── Component ─────────────────────────────────────────────────────────

export function SalesDashboard() {
  const { data: ordersData }   = useSaleOrderList();
  const { data: challansData } = useDeliveryChallanList();
  const { data: returnsData }  = useSaleReturnList();
  const { data: creditData }   = useCreditNoteList();

  const orders   = useMemo(() => { const r = (ordersData as any)?.data ?? ordersData ?? []; return Array.isArray(r) ? r : []; }, [ordersData]);
  const challans = useMemo(() => { const r = (challansData as any)?.data ?? challansData ?? []; return Array.isArray(r) ? r : []; }, [challansData]);
  const returns  = useMemo(() => { const r = (returnsData as any)?.data ?? returnsData ?? []; return Array.isArray(r) ? r : []; }, [returnsData]);
  const credits  = useMemo(() => { const r = (creditData as any)?.data ?? creditData ?? []; return Array.isArray(r) ? r : []; }, [creditData]);

  // KPI computations
  const totalOrderValue = orders.reduce((s: number, o: any) => s + (o.grandTotal ?? 0), 0);
  const pendingOrders   = orders.filter((o: any) => o.status === 'PENDING' || o.status === 'DRAFT').length;
  const activeChallans  = challans.filter((c: any) => c.status === 'DISPATCHED').length;
  const openReturns     = returns.filter((r: any) => r.status === 'PENDING' || r.status === 'INSPECTING').length;

  const fmt = (n: number) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  // Recent orders (last 5)
  const recentOrders = [...orders]
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const kpiItems = [
    { label: 'Orders',     value: orders.length, sub: `${pendingOrders} pending`, color: '#6b7280' },
    { label: 'Value',      value: fmt(totalOrderValue), color: '#2563eb' },
    { label: 'Deliveries', value: activeChallans, sub: 'in transit', color: '#d97706' },
    { label: 'Returns',    value: openReturns, sub: `${credits.length} credit notes`, color: '#dc2626' },
  ];

  return (
    <div className="h-full flex flex-col bg-white">
      {/* ── Toolbar (matches TableFull header bar) ────────────── */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white shadow-sm z-40">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-gray-900">Sales Dashboard</h1>
          <div className="h-5 w-px bg-gray-300" />

          {/* Inline KPI stats */}
          <div className="flex items-center gap-5">
            {kpiItems.map((k) => (
              <div key={k.label} className="flex items-center gap-1.5">
                <span className="text-base font-bold" style={{ color: k.color }}>
                  {k.value}
                </span>
                <span className="text-xs text-gray-400">{k.label}</span>
                {k.sub && (
                  <span className="text-[10px] text-gray-300">({k.sub})</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Nav links as pill buttons */}
          <div className="flex items-center bg-gray-100 rounded-md p-0.5">
            {NAV_LINKS.map(({ label, href, icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-gray-500 hover:text-gray-700 rounded transition-colors no-underline"
              >
                <Icon name={icon as any} size={12} />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* ── Content area ──────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">

        {/* Recent Orders */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <span className="font-semibold text-sm text-gray-900">Recent Sale Orders</span>
            <Link href="/sales/orders" className="text-xs text-blue-600 no-underline hover:underline">View all</Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-sm">No orders yet</div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  {['Order #', 'Customer', 'Date', 'Total', 'Status'].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o: any, i: number) => (
                  <tr key={o.id} className={i > 0 ? 'border-t border-gray-100' : ''}>
                    <td className="px-4 py-2.5 text-sm font-semibold text-blue-600">
                      <Link href={`/sales/orders/${o.id}`} className="no-underline text-inherit">{o.orderNumber}</Link>
                    </td>
                    <td className="px-4 py-2.5 text-sm text-gray-700">{o.customerId}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-500">{new Date(o.orderDate).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-2.5 text-sm font-semibold text-gray-900">{fmt(o.grandTotal ?? 0)}</td>
                    <td className="px-4 py-2.5">
                      <Badge variant={ORDER_STATUS_VARIANT[o.status] ?? 'secondary'}>{o.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Bottom row: Challans + Returns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Delivery Challans */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
              <span className="font-semibold text-sm text-gray-900">Delivery Challans</span>
              <Link href="/sales/delivery-challans" className="text-xs text-blue-600 no-underline hover:underline">View all</Link>
            </div>
            {challans.length === 0 ? (
              <div className="py-6 text-center text-gray-400 text-sm">No challans yet</div>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    {['Challan #', 'Dispatch Date', 'Status'].map((h) => (
                      <th key={h} className="px-3.5 py-2 text-left text-[11px] font-semibold text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {challans.slice(0, 4).map((c: any, i: number) => (
                    <tr key={c.id} className={i > 0 ? 'border-t border-gray-100' : ''}>
                      <td className="px-3.5 py-2 text-sm font-semibold text-gray-700">{c.challanNumber}</td>
                      <td className="px-3.5 py-2 text-sm text-gray-500">{c.dispatchDate ? new Date(c.dispatchDate).toLocaleDateString('en-IN') : '—'}</td>
                      <td className="px-3.5 py-2"><Badge variant={c.status === 'DELIVERED' ? 'success' : c.status === 'DISPATCHED' ? 'warning' : 'secondary'}>{c.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Sale Returns */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
              <span className="font-semibold text-sm text-gray-900">Sale Returns</span>
              <Link href="/sales/returns" className="text-xs text-blue-600 no-underline hover:underline">View all</Link>
            </div>
            {returns.length === 0 ? (
              <div className="py-6 text-center text-gray-400 text-sm">No returns yet</div>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    {['Return #', 'Date', 'Total', 'Status'].map((h) => (
                      <th key={h} className="px-3.5 py-2 text-left text-[11px] font-semibold text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {returns.slice(0, 4).map((r: any, i: number) => (
                    <tr key={r.id} className={i > 0 ? 'border-t border-gray-100' : ''}>
                      <td className="px-3.5 py-2 text-sm font-semibold text-gray-700">{r.returnNumber}</td>
                      <td className="px-3.5 py-2 text-sm text-gray-500">{new Date(r.returnDate).toLocaleDateString('en-IN')}</td>
                      <td className="px-3.5 py-2 text-sm font-semibold">{fmt(r.grandTotal ?? 0)}</td>
                      <td className="px-3.5 py-2"><Badge variant={r.status === 'ACCEPTED' ? 'success' : r.status === 'PENDING' ? 'warning' : 'secondary'}>{r.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

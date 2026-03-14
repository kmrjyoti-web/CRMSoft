'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui';
import { useSaleOrderList, useDeliveryChallanList, useSaleReturnList, useCreditNoteList } from '../hooks/useSales';

// ── KPI Card ──────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb',
      padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: color ?? '#111827' }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: '#9ca3af' }}>{sub}</div>}
    </div>
  );
}

// ── Status color helpers ──────────────────────────────────────────────

const ORDER_STATUS_VARIANT: Record<string, 'success' | 'warning' | 'danger' | 'secondary' | 'primary'> = {
  APPROVED: 'success', PENDING: 'warning', CANCELLED: 'danger',
  DRAFT: 'secondary', PARTIALLY_DELIVERED: 'primary', DELIVERED: 'success',
};

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
  const totalOrderValue  = orders.reduce((s: number, o: any) => s + (o.grandTotal ?? 0), 0);
  const pendingOrders    = orders.filter((o: any) => o.status === 'PENDING' || o.status === 'DRAFT').length;
  const activeChallans   = challans.filter((c: any) => c.status === 'DISPATCHED').length;
  const openReturns      = returns.filter((r: any) => r.status === 'PENDING' || r.status === 'INSPECTING').length;

  const fmt = (n: number) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  // Recent orders (last 5)
  const recentOrders = [...orders]
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>Sales Dashboard</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { label: 'Orders',      href: '/sales/orders' },
            { label: 'Challans',    href: '/sales/delivery-challans' },
            { label: 'Returns',     href: '/sales/returns' },
            { label: 'Credit Notes',href: '/sales/credit-notes' },
          ].map(({ label, href }) => (
            <Link key={href} href={href} style={{
              fontSize: 12, fontWeight: 500, color: '#374151', padding: '5px 12px',
              border: '1px solid #d1d5db', borderRadius: 6, textDecoration: 'none',
              background: '#fff',
            }}>
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <KpiCard label="Total Orders"       value={orders.length}    sub={`${pendingOrders} pending approval`} />
        <KpiCard label="Total Order Value"  value={fmt(totalOrderValue)} color="#2563eb" />
        <KpiCard label="Active Deliveries"  value={activeChallans}   sub="in transit" color="#d97706" />
        <KpiCard label="Open Returns"       value={openReturns}      sub={`${credits.length} credit notes`} color="#dc2626" />
      </div>

      {/* Recent Orders */}
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>Recent Sale Orders</span>
          <Link href="/sales/orders" style={{ fontSize: 12, color: '#2563eb', textDecoration: 'none' }}>View all</Link>
        </div>
        {recentOrders.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No orders yet</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['Order #', 'Customer', 'Date', 'Total', 'Status'].map((h) => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o: any, i: number) => (
                <tr key={o.id} style={{ borderTop: i > 0 ? '1px solid #f3f4f6' : undefined }}>
                  <td style={{ padding: '10px 16px', fontSize: 13, fontWeight: 600, color: '#2563eb' }}>
                    <Link href={`/sales/orders/${o.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>{o.orderNumber}</Link>
                  </td>
                  <td style={{ padding: '10px 16px', fontSize: 13, color: '#374151' }}>{o.customerId}</td>
                  <td style={{ padding: '10px 16px', fontSize: 13, color: '#6b7280' }}>{new Date(o.orderDate).toLocaleDateString('en-IN')}</td>
                  <td style={{ padding: '10px 16px', fontSize: 13, fontWeight: 600, color: '#111827' }}>{fmt(o.grandTotal ?? 0)}</td>
                  <td style={{ padding: '10px 16px' }}>
                    <Badge variant={ORDER_STATUS_VARIANT[o.status] ?? 'secondary'}>{o.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Bottom row: Challans + Returns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Recent Challans */}
        <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>Delivery Challans</span>
            <Link href="/sales/delivery-challans" style={{ fontSize: 12, color: '#2563eb', textDecoration: 'none' }}>View all</Link>
          </div>
          {challans.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No challans yet</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  {['Challan #', 'Dispatch Date', 'Status'].map((h) => (
                    <th key={h} style={{ padding: '8px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {challans.slice(0, 4).map((c: any, i: number) => (
                  <tr key={c.id} style={{ borderTop: i > 0 ? '1px solid #f3f4f6' : undefined }}>
                    <td style={{ padding: '8px 14px', fontSize: 13, fontWeight: 600, color: '#374151' }}>{c.challanNumber}</td>
                    <td style={{ padding: '8px 14px', fontSize: 13, color: '#6b7280' }}>{c.dispatchDate ? new Date(c.dispatchDate).toLocaleDateString('en-IN') : '—'}</td>
                    <td style={{ padding: '8px 14px' }}><Badge variant={c.status === 'DELIVERED' ? 'success' : c.status === 'DISPATCHED' ? 'warning' : 'secondary'}>{c.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent Returns */}
        <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>Sale Returns</span>
            <Link href="/sales/returns" style={{ fontSize: 12, color: '#2563eb', textDecoration: 'none' }}>View all</Link>
          </div>
          {returns.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No returns yet</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  {['Return #', 'Date', 'Total', 'Status'].map((h) => (
                    <th key={h} style={{ padding: '8px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {returns.slice(0, 4).map((r: any, i: number) => (
                  <tr key={r.id} style={{ borderTop: i > 0 ? '1px solid #f3f4f6' : undefined }}>
                    <td style={{ padding: '8px 14px', fontSize: 13, fontWeight: 600, color: '#374151' }}>{r.returnNumber}</td>
                    <td style={{ padding: '8px 14px', fontSize: 13, color: '#6b7280' }}>{new Date(r.returnDate).toLocaleDateString('en-IN')}</td>
                    <td style={{ padding: '8px 14px', fontSize: 13, fontWeight: 600 }}>{fmt(r.grandTotal ?? 0)}</td>
                    <td style={{ padding: '8px 14px' }}><Badge variant={r.status === 'ACCEPTED' ? 'success' : r.status === 'PENDING' ? 'warning' : 'secondary'}>{r.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/common/empty-state';
import { StatusBadge } from '@/components/common/status-badge';
import { useOrders } from '@/hooks/use-orders';
import { useDebounce } from '@/hooks/use-debounce';
import { formatCurrency, formatDate, extractList } from '@/lib/utils';
import { ORDER_STATUS } from '@/lib/constants';
import type { Order, OrderFilters } from '@/types/order';

export default function OrdersPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  const filters: OrderFilters = {
    search: debouncedSearch || undefined,
    status: statusFilter ? (statusFilter as OrderFilters['status']) : undefined,
    page,
    limit: 20,
  };

  const { data: res, isLoading } = useOrders(filters);
  const orders: Order[] = extractList(res);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-500">Manage your incoming orders</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px]">
          <Input leftIcon={<Search className="h-4 w-4" />} placeholder="Search by order # or buyer..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <Select
          options={[{ value: '', label: 'All Status' }, ...ORDER_STATUS.map((s) => ({ value: s.value, label: s.label }))]}
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="w-44"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : orders.length === 0 ? (
        <EmptyState icon={ShoppingCart} title="No orders yet" description="Orders will appear here when buyers place them" />
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Order</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Buyer</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Items</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Total</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Payment</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/orders/${order.id}`)}>
                  <td className="px-4 py-3 text-sm font-medium text-primary">{order.orderNumber}</td>
                  <td className="px-4 py-3 text-sm">{order.buyer?.firstName} {order.buyer?.lastName}</td>
                  <td className="px-4 py-3 text-sm">{order.items?.length ?? 0} items</td>
                  <td className="px-4 py-3 text-sm font-semibold">{formatCurrency(order.totalAmount)}</td>
                  <td className="px-4 py-3"><StatusBadge value={order.status} /></td>
                  <td className="px-4 py-3"><StatusBadge value={order.paymentStatus} /></td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatDate(order.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>Previous</Button>
        <span className="text-sm text-gray-500">Page {page}</span>
        <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={orders.length < 20}>Next</Button>
      </div>
    </div>
  );
}

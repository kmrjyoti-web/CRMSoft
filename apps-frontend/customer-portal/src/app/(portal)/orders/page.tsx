'use client';

import { useState } from 'react';
import { ShoppingCart, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, statusBadgeVariant } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePortalOrders } from '@/hooks/usePortal';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { PortalOrder } from '@/types/portal';

function OrderRow({ order }: { order: PortalOrder }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr
        className="border-b hover:bg-gray-50 cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <td className="py-3 pr-4 font-medium text-primary">{order.orderNumber}</td>
        <td className="py-3 pr-4 text-muted-foreground">{formatDate(order.date)}</td>
        <td className="py-3 pr-4 font-semibold">{formatCurrency(order.totalAmount)}</td>
        <td className="py-3 pr-4">
          <Badge variant={statusBadgeVariant(order.status)}>{order.status}</Badge>
        </td>
        <td className="py-3">
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </td>
      </tr>
      {expanded && (
        <tr className="border-b bg-gray-50">
          <td colSpan={5} className="px-4 py-3">
            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
              Order Items
            </p>
            <div className="space-y-1">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>
                    {item.name}{' '}
                    <span className="text-muted-foreground">× {item.qty}</span>
                  </span>
                  <span className="font-medium">{formatCurrency(item.rate * item.qty)}</span>
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = usePortalOrders(page);

  const orders = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-14 bg-gray-100 rounded-lg" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-muted-foreground">No orders found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-3 pr-4 font-medium">Order #</th>
                      <th className="pb-3 pr-4 font-medium">Date</th>
                      <th className="pb-3 pr-4 font-medium">Amount</th>
                      <th className="pb-3 pr-4 font-medium">Status</th>
                      <th className="pb-3 font-medium" />
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <OrderRow key={order.id} order={order} />
                    ))}
                  </tbody>
                </table>
              </div>

              {meta && meta.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Page {meta.page} of {meta.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p - 1)}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page === meta.totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Truck, CheckCircle, Package, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/common/status-badge';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { useOrder, useUpdateOrderStatus, useUpdateTracking } from '@/hooks/use-orders';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ORDER_STATUS } from '@/lib/constants';

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: res, isLoading, refetch } = useOrder(params.id);
  const statusMut = useUpdateOrderStatus();
  const trackingMut = useUpdateTracking();

  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('');

  const order = res?.data;

  if (isLoading) return <LoadingSpinner />;
  if (!order) return <div className="text-center py-16 text-gray-500">Order not found</div>;

  const handleStatusUpdate = async () => {
    if (!newStatus) return;
    try {
      await statusMut.mutateAsync({ id: order.id, status: newStatus });
      toast.success('Order status updated');
      setNewStatus('');
      refetch();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleTrackingUpdate = async () => {
    if (!trackingNumber || !carrier) return;
    try {
      await trackingMut.mutateAsync({ id: order.id, data: { trackingNumber, carrier } });
      toast.success('Tracking info updated');
      refetch();
    } catch {
      toast.error('Failed to update tracking');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Order {order.orderNumber}</h1>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge value={order.status} />
              <StatusBadge value={order.paymentStatus} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Order Items */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Items</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {order.items?.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="h-12 w-12 rounded bg-gray-200 flex items-center justify-center">
                    <Package className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.listing?.title ?? 'Item'}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity} x {formatCurrency(item.unitPrice)}</p>
                  </div>
                  <p className="text-sm font-semibold">{formatCurrency(item.totalPrice)}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Tax</span><span>{formatCurrency(order.taxAmount)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span>{formatCurrency(order.shippingAmount)}</span></div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatCurrency(order.discountAmount)}</span></div>
              )}
              <div className="flex justify-between text-base font-bold pt-2 border-t"><span>Total</span><span>{formatCurrency(order.totalAmount)}</span></div>
            </div>
          </CardContent>
        </Card>

        {/* Buyer & Shipping */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-lg">Buyer</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-2">
              <p className="font-medium">{order.buyer?.firstName} {order.buyer?.lastName}</p>
              <p className="text-gray-500">{order.buyer?.email}</p>
              {order.buyer?.phone && <p className="text-gray-500">{order.buyer.phone}</p>}
              {order.buyer?.companyName && <Badge variant="info">{order.buyer.companyName}</Badge>}
            </CardContent>
          </Card>

          {order.shippingAddress && (
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><MapPin className="h-4 w-4" />Shipping Address</CardTitle></CardHeader>
              <CardContent className="text-sm space-y-1">
                <p className="font-medium">{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.line1}</p>
                {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</p>
                <p className="text-gray-500">{order.shippingAddress.phone}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle className="text-lg">Timeline</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex justify-between"><span className="text-gray-500">Ordered</span><span>{formatDate(order.createdAt)}</span></div>
              {order.confirmedAt && <div className="flex justify-between"><span className="text-gray-500">Confirmed</span><span>{formatDate(order.confirmedAt)}</span></div>}
              {order.shippedAt && <div className="flex justify-between"><span className="text-gray-500">Shipped</span><span>{formatDate(order.shippedAt)}</span></div>}
              {order.deliveredAt && <div className="flex justify-between"><span className="text-gray-500">Delivered</span><span>{formatDate(order.deliveredAt)}</span></div>}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">Update Status</CardTitle></CardHeader>
          <CardContent className="flex gap-2">
            <Select
              options={ORDER_STATUS.map((s) => ({ value: s.value, label: s.label }))}
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              placeholder="Select new status"
              className="flex-1"
            />
            <Button onClick={handleStatusUpdate} loading={statusMut.isPending} disabled={!newStatus}>
              <CheckCircle className="h-4 w-4" />
              Update
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Shipping Info</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input label="Tracking Number" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="e.g. AWB123456" />
            <Input label="Carrier" value={carrier} onChange={(e) => setCarrier(e.target.value)} placeholder="e.g. BlueDart" />
            <Button onClick={handleTrackingUpdate} loading={trackingMut.isPending} disabled={!trackingNumber || !carrier}>
              <Truck className="h-4 w-4" />
              Update Tracking
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

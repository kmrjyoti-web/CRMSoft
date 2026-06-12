'use client';

import { useRouter } from 'next/navigation';

import { Badge, Button, Card } from '@/components/ui';
import { Icon } from '@/components/ui';

import {
  useDeliveryChallanDetail,
  useDispatchChallan,
  useDeliverChallan,
  useCancelChallan,
} from '../hooks/useSales';
import type { DeliveryChallanItem } from '../types/sales.types';
import { formatCurrency } from "@/lib/format-currency";
import { formatDate } from "@/lib/format-date";

// ── Status badge mapping ────────────────────────────────────

const STATUS_VARIANT: Record<string, 'default' | 'warning' | 'primary' | 'success' | 'danger'> = {
  DRAFT: 'default',
  DISPATCHED: 'warning',
  IN_TRANSIT: 'primary',
  DELIVERED: 'success',
  CANCELLED: 'danger',
};

// ── Helpers ─────────────────────────────────────────────────



// ── Item columns ────────────────────────────────────────────

const ITEM_COLUMNS = [
  { id: 'productId', label: 'Product ID' },
  { id: 'quantity', label: 'Quantity' },
  { id: 'unitId', label: 'Unit' },
  { id: 'unitPrice', label: 'Unit Price' },
  { id: 'batchNo', label: 'Batch No' },
  { id: 'fromLocationId', label: 'From Location' },
];

// ── Component ───────────────────────────────────────────────

interface DeliveryChallanDetailProps {
  id: string;
}

export function DeliveryChallanDetail({ id }: DeliveryChallanDetailProps) {
  const router = useRouter();
  const { data, isLoading } = useDeliveryChallanDetail(id);
  const dispatchMutation = useDispatchChallan();
  const deliverMutation = useDeliverChallan();
  const cancelMutation = useCancelChallan();

  const challan = data?.data ?? data;

  if (isLoading) {
    return (
      <div className="p-6">
        <Icon name="loader" size={24} className="animate-spin" /> Loading...
      </div>
    );
  }

  if (!challan) {
    return <div className="p-6">Delivery Challan not found.</div>;
  }

  const status = challan.status as string;
  const items: DeliveryChallanItem[] = challan.items ?? [];

  const itemRows = items.map((it: DeliveryChallanItem) => ({
    id: it.id,
    productId: it.productId,
    quantity: it.quantity,
    unitId: it.unitId,
    unitPrice: formatCurrency(it.unitPrice),
    batchNo: it.batchNo || '\u2014',
    fromLocationId: it.fromLocationId || '\u2014',
  }));

  async function handleDispatch() {
    await dispatchMutation.mutateAsync(id);
  }

  async function handleDeliver() {
    await deliverMutation.mutateAsync(id);
  }

  async function handleCancel() {
    await cancelMutation.mutateAsync(id);
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => router.back()}>
            <Icon name="arrow-left" size={20} />
          </Button>
          <h1 className="text-2xl font-semibold">{challan.challanNumber}</h1>
          <Badge variant={STATUS_VARIANT[status] ?? 'default'}>{status}</Badge>
          {challan.inventoryUpdated && (
            <Badge variant="success">
              <Icon name="check-circle" size={14} /> Inventory Updated
            </Badge>
          )}
        </div>
      </div>

      {/* ── Transport Info ── */}
      <Card>
        <div className="p-4 space-y-3">
          <h2 className="text-lg font-medium">Transport Information</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Transporter</span>
              <p className="font-medium">{challan.transporterName || '\u2014'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Vehicle</span>
              <p className="font-medium">{challan.vehicleNumber || '\u2014'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">LR Number</span>
              <p className="font-medium">{challan.lrNumber || '\u2014'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">E-Way Bill</span>
              <p className="font-medium">
                {challan.ewayBillNumber || '\u2014'}
                {challan.ewayBillDate && ` (${formatDate(challan.ewayBillDate)})`}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">From Location</span>
              <p className="font-medium">{challan.fromLocationId}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Dispatch Date</span>
              <p className="font-medium">{formatDate(challan.dispatchDate)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Delivery Date</span>
              <p className="font-medium">{formatDate(challan.deliveryDate)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Total Amount</span>
              <p className="font-medium">{formatCurrency(challan.totalAmount)}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* ── Items Table ── */}
      <Card>
        <div className="p-4 space-y-3">
          <h2 className="text-lg font-medium">Items</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                  {ITEM_COLUMNS.map((col) => (
                    <th key={col.id} style={{ padding: '10px 12px', fontSize: 13, fontWeight: 600, color: '#475569' }}>
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {itemRows.map((row) => (
                  <tr key={row.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    {ITEM_COLUMNS.map((col) => (
                      <td key={col.id} style={{ padding: '10px 12px', fontSize: 14 }}>
                        {(row as any)[col.id]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* ── Actions ── */}
      <div className="flex gap-3 justify-end">
        {status === 'DRAFT' && (
          <>
            <Button
              variant="primary"
              onClick={handleDispatch}
              disabled={dispatchMutation.isPending}
            >
              <Icon name="truck" size={16} />{' '}
              {dispatchMutation.isPending ? 'Dispatching...' : 'Dispatch'}
            </Button>
            <Button
              variant="danger"
              onClick={handleCancel}
              disabled={cancelMutation.isPending}
            >
              <Icon name="x-circle" size={16} />{' '}
              {cancelMutation.isPending ? 'Cancelling...' : 'Cancel'}
            </Button>
          </>
        )}
        {(status === 'DISPATCHED' || status === 'IN_TRANSIT') && (
          <Button
            variant="primary"
            onClick={handleDeliver}
            disabled={deliverMutation.isPending}
          >
            <Icon name="check" size={16} />{' '}
            {deliverMutation.isPending ? 'Marking...' : 'Mark Delivered'}
          </Button>
        )}
      </div>
    </div>
  );
}

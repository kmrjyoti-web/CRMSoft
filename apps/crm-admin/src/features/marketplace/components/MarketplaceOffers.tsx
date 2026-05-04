"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { TableFull, Badge } from "@/components/ui";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { useOffers, useActivateOffer, usePauseOffer, useCloseOffer } from "../hooks/useMarketplace";
import type { OfferListParams, MarketplaceOffer } from "../types/marketplace.types";

const COLUMNS = [
  { id: "title", label: "Title", visible: true },
  { id: "offerType", label: "Offer Type", visible: true },
  { id: "discountType", label: "Discount Type", visible: true },
  { id: "discountValue", label: "Discount", visible: true },
  { id: "status", label: "Status", visible: true },
  { id: "redemptions", label: "Redemptions", visible: true },
  { id: "clickCount", label: "Clicks", visible: true },
  { id: "orderCount", label: "Orders", visible: true },
  { id: "totalOrderValue", label: "Order Value (INR)", visible: true },
  { id: "expiresAt", label: "Expires", visible: true },
];

const STATUS_VARIANT: Record<string, "success" | "secondary" | "warning" | "danger" | "default"> = {
  ACTIVE: 'success',
  DRAFT: 'secondary',
  SCHEDULED: 'warning',
  PAUSED: 'warning',
  EXPIRED: 'danger',
  CLOSED: 'danger',
  ARCHIVED: 'default',
};

export function MarketplaceOffersPage() {
  const router = useRouter();
  const [params] = useState<OfferListParams>({ page: 1, limit: 50 });

  const { data, isLoading } = useOffers(params);
  const { mutate: activate } = useActivateOffer();
  const { mutate: pause } = usePauseOffer();
  const { mutate: close } = useCloseOffer();

  const offers = useMemo<MarketplaceOffer[]>(() => {
    const nested = (data as { data?: { data?: MarketplaceOffer[] } | MarketplaceOffer[] })?.data;
    if (!nested) return [];
    if (Array.isArray(nested)) return nested;
    const withData = nested as { data?: MarketplaceOffer[] };
    return withData.data ?? [];
  }, [data]);

  const tableData = useMemo(
    () =>
      offers.map((o) => ({
        ...o,
        offerType: (
          <span className="text-xs font-medium text-indigo-600 bg-indigo-50 rounded px-2 py-0.5">{o.offerType}</span>
        ),
        discountType: (
          <span className="text-xs font-medium text-purple-600 bg-purple-50 rounded px-2 py-0.5">
            {o.discountType}
          </span>
        ),
        discountValue:
          o.discountType === 'PERCENTAGE'
            ? `${o.discountValue}%`
            : `\u20B9${(o.discountValue / 100).toLocaleString('en-IN')}`,
        status: <Badge variant={STATUS_VARIANT[o.status] ?? 'default'}>{o.status}</Badge>,
        redemptions: o.maxRedemptions
          ? `${o.currentRedemptions} / ${o.maxRedemptions}`
          : o.currentRedemptions.toString(),
        totalOrderValue: `\u20B9${(o.totalOrderValue / 100).toLocaleString('en-IN')}`,
        expiresAt: o.expiresAt ? new Date(o.expiresAt).toLocaleDateString('en-IN') : '\u2014',
        _actions: (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            {o.status === 'DRAFT' || o.status === 'PAUSED' ? (
              <button
                onClick={() => activate(o.id)}
                className="text-xs px-2 py-1 text-white bg-green-600 hover:bg-green-700 rounded"
              >
                Activate
              </button>
            ) : null}
            {o.status === 'ACTIVE' ? (
              <button
                onClick={() => pause(o.id)}
                className="text-xs px-2 py-1 text-amber-700 bg-amber-100 hover:bg-amber-200 rounded"
              >
                Pause
              </button>
            ) : null}
            {o.status === 'ACTIVE' ? (
              <button
                onClick={() => close(o.id)}
                className="text-xs px-2 py-1 text-red-700 bg-red-100 hover:bg-red-200 rounded"
              >
                Close
              </button>
            ) : null}
          </div>
        ),
      })),
    [offers, activate, pause, close],
  );

  if (isLoading) return <TableSkeleton title="Offers" />;

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 min-h-0">
        <TableFull
          data={tableData as Record<string, unknown>[]}
          title="Marketplace Offers"
          tableKey="marketplace-offers"
          columns={[...COLUMNS, { id: '_actions', label: 'Actions', visible: true }]}
          defaultViewMode="table"
          defaultDensity="compact"
          onRowEdit={(row: Record<string, unknown>) => console.log('edit offer', row.id)}
          onCreate={() => router.push('/marketplace/offers/new')}
        />
      </div>
    </div>
  );
}

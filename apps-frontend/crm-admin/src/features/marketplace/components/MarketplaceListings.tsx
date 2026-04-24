"use client";
import { useState, useMemo } from "react";
import { TableFull, Badge, Icon } from "@/components/ui";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { useListings, usePublishListing, useDeleteListing } from "../hooks/useMarketplace";
import type { ListingListParams, MarketplaceListing } from "../types/marketplace.types";

const COLUMNS = [
  { id: "title", label: "Title", visible: true },
  { id: "listingType", label: "Type", visible: true },
  { id: "status", label: "Status", visible: true },
  { id: "basePrice", label: "Price (INR)", visible: true },
  { id: "stockAvailable", label: "Stock", visible: true },
  { id: "viewCount", label: "Views", visible: true },
  { id: "enquiryCount", label: "Enquiries", visible: true },
  { id: "avgRating", label: "Rating", visible: true },
  { id: "createdAt", label: "Created", visible: true },
];

const STATUS_VARIANT: Record<string, "success" | "secondary" | "warning" | "danger" | "default"> = {
  ACTIVE: 'success',
  DRAFT: 'secondary',
  PAUSED: 'warning',
  EXPIRED: 'danger',
  ARCHIVED: 'default',
  SOLD_OUT: 'danger',
  SCHEDULED: 'warning',
  REJECTED: 'danger',
};

export function MarketplaceListingsPage() {
  const [params] = useState<ListingListParams>({ page: 1, limit: 50 });

  const { data, isLoading } = useListings(params);
  const { mutate: publish } = usePublishListing();
  const { mutate: remove } = useDeleteListing();

  const listings = useMemo<MarketplaceListing[]>(() => {
    const nested = (data as { data?: { data?: MarketplaceListing[]; meta?: unknown } | MarketplaceListing[] })?.data;
    if (!nested) return [];
    if (Array.isArray(nested)) return nested;
    const withData = nested as { data?: MarketplaceListing[] };
    return withData.data ?? [];
  }, [data]);

  const tableData = useMemo(
    () =>
      listings.map((l) => ({
        ...l,
        listingType: (
          <span className="text-xs font-medium text-indigo-600 bg-indigo-50 rounded px-2 py-0.5">
            {l.listingType}
          </span>
        ),
        status: <Badge variant={STATUS_VARIANT[l.status] ?? 'default'}>{l.status}</Badge>,
        basePrice: `\u20B9${(l.basePrice / 100).toLocaleString('en-IN')}`,
        avgRating: l.avgRating ? (
          <span className="flex items-center gap-1">
            <Icon name="star" size={12} color="#f59e0b" />
            {l.avgRating.toFixed(1)}
          </span>
        ) : (
          '\u2014'
        ),
        createdAt: new Date(l.createdAt).toLocaleDateString('en-IN'),
        _actions: (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            {l.status === 'DRAFT' && (
              <button
                onClick={() => publish(l.id)}
                className="text-xs px-2 py-1 text-white bg-green-600 hover:bg-green-700 rounded"
              >
                Publish
              </button>
            )}
            <button
              onClick={() => remove(l.id)}
              className="text-xs px-2 py-1 text-white bg-red-500 hover:bg-red-600 rounded"
            >
              Delete
            </button>
          </div>
        ),
      })),
    [listings, publish, remove],
  );

  if (isLoading) return <TableSkeleton title="Listings" />;

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 min-h-0">
        <TableFull
          data={tableData as Record<string, unknown>[]}
          title="Marketplace Listings"
          tableKey="marketplace-listings"
          columns={[...COLUMNS, { id: '_actions', label: 'Actions', visible: true }]}
          defaultViewMode="table"
          defaultDensity="compact"
          onRowEdit={(row: Record<string, unknown>) => console.log('edit', row.id)}
        />
      </div>
    </div>
  );
}

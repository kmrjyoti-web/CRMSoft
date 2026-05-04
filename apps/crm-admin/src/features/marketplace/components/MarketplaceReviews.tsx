"use client";
import { useState, useMemo } from "react";
import { TableFull, Badge } from "@/components/ui";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { useReviews, useApproveReview, useRejectReview } from "../hooks/useMarketplace";
import { ReviewModerationCard } from "./ReviewModerationCard";
import type { ReviewListParams, MarketplaceReview } from "../types/marketplace.types";

const ALL_COLUMNS = [
  { id: "listingId", label: "Listing", visible: true },
  { id: "rating", label: "Rating", visible: true },
  { id: "title", label: "Title", visible: true },
  { id: "status", label: "Status", visible: true },
  { id: "isVerifiedPurchase", label: "Verified", visible: true },
  { id: "helpfulCount", label: "Helpful", visible: true },
  { id: "reportCount", label: "Reports", visible: true },
  { id: "createdAt", label: "Date", visible: true },
];

const STATUS_VARIANT: Record<string, "success" | "secondary" | "warning" | "danger" | "default"> = {
  APPROVED: 'success',
  PENDING: 'warning',
  REJECTED: 'danger',
  FLAGGED: 'secondary',
};

type Tab = 'PENDING' | 'ALL';

export function MarketplaceReviewsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('PENDING');
  const [params] = useState<ReviewListParams>({ page: 1, limit: 50 });

  const pendingParams: ReviewListParams = { ...params, status: 'PENDING' };
  const { data: pendingData, isLoading: pendingLoading } = useReviews(pendingParams);
  const { data: allData, isLoading: allLoading } = useReviews(params);

  const { mutate: approve, isPending: approving } = useApproveReview();
  const { mutate: reject, isPending: rejecting } = useRejectReview();

  const pendingReviews = useMemo<MarketplaceReview[]>(() => {
    const nested = (pendingData as { data?: { data?: MarketplaceReview[] } | MarketplaceReview[] })?.data;
    if (!nested) return [];
    if (Array.isArray(nested)) return nested;
    return (nested as { data?: MarketplaceReview[] }).data ?? [];
  }, [pendingData]);

  const allReviews = useMemo<MarketplaceReview[]>(() => {
    const nested = (allData as { data?: { data?: MarketplaceReview[] } | MarketplaceReview[] })?.data;
    if (!nested) return [];
    if (Array.isArray(nested)) return nested;
    return (nested as { data?: MarketplaceReview[] }).data ?? [];
  }, [allData]);

  const allTableData = useMemo(
    () =>
      allReviews.map((r) => ({
        ...r,
        rating: (
          <span className="flex items-center gap-1 text-sm font-medium text-amber-600">
            {r.rating}
            <span className="text-gray-400">/5</span>
          </span>
        ),
        status: <Badge variant={STATUS_VARIANT[r.status] ?? 'default'}>{r.status}</Badge>,
        isVerifiedPurchase: r.isVerifiedPurchase ? (
          <Badge variant="success">Verified</Badge>
        ) : (
          <span className="text-xs text-gray-400">Unverified</span>
        ),
        createdAt: new Date(r.createdAt).toLocaleDateString('en-IN'),
      })),
    [allReviews],
  );

  return (
    <div className="h-full flex flex-col">
      {/* Tab bar */}
      <div className="flex border-b border-gray-200 bg-white px-4">
        {(['PENDING', 'ALL'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'PENDING' ? `Pending (${pendingReviews.length})` : 'All Reviews'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'PENDING' ? (
          <div className="p-5">
            {pendingLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse h-32" />
                ))}
              </div>
            ) : pendingReviews.length === 0 ? (
              <div className="text-center py-16 text-gray-400 text-sm">No pending reviews</div>
            ) : (
              <div className="space-y-4 max-w-2xl">
                {pendingReviews.map((review) => (
                  <ReviewModerationCard
                    key={review.id}
                    review={review}
                    onApprove={(id) => approve(id)}
                    onReject={(id, note) => reject({ id, note })}
                    isLoading={approving || rejecting}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="h-full">
            {allLoading ? (
              <TableSkeleton title="Reviews" />
            ) : (
              <TableFull
                data={allTableData as Record<string, unknown>[]}
                title="All Reviews"
                tableKey="marketplace-reviews"
                columns={ALL_COLUMNS}
                defaultViewMode="table"
                defaultDensity="compact"
                onRowEdit={(row: Record<string, unknown>) => console.log('view review', row.id)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

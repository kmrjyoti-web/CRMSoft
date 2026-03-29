'use client';

import Link from 'next/link';
import { useOffers } from '../../../hooks/useOffers';
import { CountdownTimer } from '../../../components/offers/CountdownTimer';
import { RedemptionProgress } from '../../../components/offers/RedemptionProgress';
import { ShimmerList } from '../../../components/common/ShimmerCard';
import { EmptyState } from '../../../components/common/EmptyState';
import { InfiniteScroll } from '../../../components/common/InfiniteScroll';
import { Tag } from 'lucide-react';

export default function OffersPage() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useOffers();
  const offers = data?.pages.flatMap((p) => p.items) ?? [];

  if (isLoading) return <ShimmerList count={4} />;
  if (!offers.length) return <EmptyState title="No active offers" description="Check back later for deals and discounts" />;

  return (
    <div className="p-4 space-y-3">
      {offers.map((offer) => (
        <Link key={offer.id} href={`/offers/${offer.id}`}>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden active:scale-[0.99] transition-transform">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                  <Tag size={18} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold leading-tight">{offer.title}</p>
                  {offer.discountValue && (
                    <span className="inline-block bg-white text-orange-600 font-bold text-xs px-2 py-0.5 rounded-lg mt-1">
                      {offer.discountType === 'PERCENTAGE'
                        ? `${offer.discountValue}% OFF`
                        : `₹${offer.discountValue} OFF`}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="p-4 space-y-2">
              {offer.code && (
                <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl px-3 py-2 flex items-center justify-between">
                  <span className="font-mono font-bold text-gray-800 tracking-wider text-sm">{offer.code}</span>
                  <span className="text-xs text-gray-400">Code</span>
                </div>
              )}
              {offer.expiresAt && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Ends in:</span>
                  <CountdownTimer expiresAt={offer.expiresAt} />
                </div>
              )}
              {offer.maxRedemptions && offer.currentRedemptions !== undefined && (
                <RedemptionProgress current={offer.currentRedemptions} max={offer.maxRedemptions} />
              )}
            </div>
          </div>
        </Link>
      ))}
      <InfiniteScroll onLoadMore={fetchNextPage} hasMore={!!hasNextPage} isLoading={isFetchingNextPage} />
    </div>
  );
}

'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useListing } from '../../../../hooks/useListings';
import { useReviews, useCreateReview } from '../../../../hooks/useReviews';
import { ImageCarousel } from '../../../../components/product/ImageCarousel';
import { PriceDisplay } from '../../../../components/product/PriceDisplay';
import { EnquiryForm } from '../../../../components/product/EnquiryForm';
import { ReviewForm } from '../../../../components/product/ReviewForm';
import { StarRating } from '../../../../components/common/StarRating';
import { Avatar } from '../../../../components/common/Avatar';
import { ShimmerCard } from '../../../../components/common/ShimmerCard';
import { InfiniteScroll } from '../../../../components/common/InfiniteScroll';
import { ChevronLeft, MessageSquare, Star } from 'lucide-react';
import { timeAgo } from '../../../../lib/formatters';

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: listing, isLoading } = useListing(id);
  const {
    data: reviewData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useReviews(id);
  const [showEnquiry, setShowEnquiry] = useState(false);
  const [showReview, setShowReview] = useState(false);

  const reviews = reviewData?.pages.flatMap((p) => p.items) ?? [];

  if (isLoading) return <div className="p-4 space-y-4"><ShimmerCard /><ShimmerCard /></div>;
  if (!listing) return null;

  return (
    <>
      <div className="pb-32">
        {/* Back */}
        <div className="absolute top-14 left-0 z-10 p-4">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center"
          >
            <ChevronLeft size={20} className="text-white" />
          </button>
        </div>

        {/* Images */}
        {listing.images && listing.images.length > 0 ? (
          <ImageCarousel images={listing.images} alt={listing.title} aspectRatio="aspect-[4/3]" />
        ) : (
          <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400">No image</span>
          </div>
        )}

        <div className="p-4 space-y-4">
          {/* Title + Price */}
          <div className="space-y-1">
            <div className="flex items-start justify-between gap-2">
              <h1 className="font-bold text-gray-900 text-xl leading-tight flex-1">{listing.title}</h1>
              <span className="shrink-0 text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-lg font-medium">
                {listing.category}
              </span>
            </div>
            <PriceDisplay price={listing.price} mrp={listing.mrp} size="lg" />
            {listing.unit && (
              <p className="text-xs text-gray-500">Per {listing.unit}</p>
            )}
            {listing.minOrder && (
              <p className="text-xs text-gray-500">Min order: {listing.minOrder} units</p>
            )}
          </div>

          {/* Seller */}
          <div className="flex items-center gap-3 bg-gray-50 rounded-2xl p-3">
            <Avatar name={listing.sellerName} src={listing.sellerAvatar} size={40} />
            <div>
              <p className="font-semibold text-sm text-gray-900">{listing.sellerName}</p>
              <p className="text-xs text-gray-500">Seller</p>
            </div>
          </div>

          {/* Description */}
          {listing.description && (
            <div>
              <h2 className="font-semibold text-gray-900 mb-1">Description</h2>
              <p className="text-sm text-gray-700 leading-relaxed">{listing.description}</p>
            </div>
          )}

          {/* Tags */}
          {listing.tags && listing.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {listing.tags.map((tag: string) => (
                <span key={tag} className="text-xs bg-orange-50 text-orange-500 px-2 py-1 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Reviews */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-900">Reviews</h2>
              <button
                onClick={() => setShowReview(true)}
                className="flex items-center gap-1 text-orange-500 text-sm font-medium"
              >
                <Star size={14} />
                Write Review
              </button>
            </div>

            {reviews.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No reviews yet. Be the first!</p>
            ) : (
              <div className="space-y-3">
                {reviews.map((r) => (
                  <div key={r.id} className="bg-gray-50 rounded-2xl p-3 space-y-1">
                    <div className="flex items-center gap-2">
                      <Avatar name={r.reviewerName} size={28} />
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-900">{r.reviewerName}</p>
                        <p className="text-xs text-gray-400">{timeAgo(r.createdAt)}</p>
                      </div>
                      <StarRating value={r.rating} size={14} />
                    </div>
                    {r.title && <p className="text-sm font-medium text-gray-900">{r.title}</p>}
                    <p className="text-sm text-gray-600">{r.body}</p>
                  </div>
                ))}
                <InfiniteScroll onLoadMore={fetchNextPage} hasMore={!!hasNextPage} isLoading={isFetchingNextPage} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto z-30 bg-white border-t border-gray-100 p-4 flex gap-3 pb-safe">
        <button
          onClick={() => setShowReview(true)}
          className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700"
        >
          <MessageSquare size={16} />
          Review
        </button>
        <button
          onClick={() => setShowEnquiry(true)}
          className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-orange-200"
        >
          Send Enquiry
        </button>
      </div>

      {showEnquiry && (
        <EnquiryForm listingId={id} listingTitle={listing.title} onClose={() => setShowEnquiry(false)} />
      )}
      {showReview && (
        <ReviewForm listingId={id} onClose={() => setShowReview(false)} />
      )}
    </>
  );
}

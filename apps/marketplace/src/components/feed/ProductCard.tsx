'use client';

import { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { Avatar } from '../common/Avatar';
import { EngagementBar } from '../engagement/EngagementBar';
import { ImageCarousel } from '../product/ImageCarousel';
import { PriceDisplay } from '../product/PriceDisplay';
import { EnquiryForm } from '../product/EnquiryForm';
import { timeAgo } from '../../lib/formatters';
import type { FeedItem } from '../../services/marketplace.service';

interface ProductCardProps {
  item: FeedItem;
}

export function ProductCard({ item }: ProductCardProps) {
  const [showEnquiry, setShowEnquiry] = useState(false);
  const listing = item.listing;

  if (!listing) return null;

  return (
    <>
      <article className="bg-white border-b border-gray-100">
        {/* Author */}
        <div className="flex items-center gap-3 px-4 pt-4 pb-2">
          <Avatar name={item.authorName} src={item.authorAvatar} size={36} />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-gray-900 truncate">{item.authorName}</p>
            <p className="text-xs text-gray-400">{timeAgo(item.createdAt)}</p>
          </div>
          <span className="bg-blue-50 text-blue-600 text-xs font-medium px-2 py-0.5 rounded-full">
            {listing.category}
          </span>
        </div>

        {/* Images */}
        {listing.images && listing.images.length > 0 && (
          <ImageCarousel images={listing.images} alt={listing.title} aspectRatio="aspect-[4/3]" />
        )}

        {/* Info */}
        <div className="px-4 pt-3 pb-1 space-y-1">
          <h3 className="font-bold text-gray-900">{listing.title}</h3>
          <PriceDisplay price={listing.price} mrp={listing.mrp} size="md" />
          {listing.description && (
            <p className="text-sm text-gray-500 line-clamp-2">{listing.description}</p>
          )}
          {listing.stock !== undefined && listing.stock <= 10 && listing.stock > 0 && (
            <p className="text-xs text-red-500 font-medium">Only {listing.stock} left!</p>
          )}
        </div>

        {/* Enquiry CTA */}
        <div className="px-4 pb-3">
          <button
            onClick={() => setShowEnquiry(true)}
            className="flex items-center gap-2 w-full justify-center bg-orange-50 text-orange-600 font-semibold text-sm py-2.5 rounded-xl border border-orange-200 active:bg-orange-100"
          >
            <ShoppingBag size={16} />
            Send Enquiry
          </button>
        </div>

        <div className="px-4 pb-2">
          <EngagementBar item={item} />
        </div>
      </article>

      {showEnquiry && (
        <EnquiryForm
          listingId={listing.id}
          listingTitle={listing.title}
          onClose={() => setShowEnquiry(false)}
        />
      )}
    </>
  );
}

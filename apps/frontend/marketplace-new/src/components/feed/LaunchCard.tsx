'use client';

import { Rocket } from 'lucide-react';
import { Avatar } from '../common/Avatar';
import { EngagementBar } from '../engagement/EngagementBar';
import { ImageCarousel } from '../product/ImageCarousel';
import { timeAgo } from '../../lib/formatters';
import type { FeedItem } from '../../services/marketplace.service';

interface LaunchCardProps {
  item: FeedItem;
}

export function LaunchCard({ item }: LaunchCardProps) {
  const listing = item.listing;
  if (!listing) return null;

  return (
    <article className="bg-white border-b border-gray-100">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <Avatar name={item.authorName} src={item.authorAvatar} size={36} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <Rocket size={13} className="text-orange-500" />
            <span className="text-xs font-bold text-orange-500 uppercase tracking-wide">New Launch</span>
          </div>
          <p className="font-semibold text-sm text-gray-900 truncate">{item.authorName}</p>
        </div>
        <span className="text-xs text-gray-400 shrink-0">{timeAgo(item.createdAt)}</span>
      </div>

      {listing.images && listing.images.length > 0 && (
        <ImageCarousel images={listing.images} alt={listing.title} aspectRatio="aspect-[16/9]" />
      )}

      <div className="px-4 pt-3 pb-1">
        <h3 className="font-bold text-gray-900 text-base">{listing.title}</h3>
        {listing.description && (
          <p className="text-sm text-gray-500 mt-1 line-clamp-3">{listing.description}</p>
        )}

        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {item.tags.map((tag) => (
              <span key={tag} className="text-xs text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 pb-2 pt-1">
        <EngagementBar item={item} />
      </div>
    </article>
  );
}

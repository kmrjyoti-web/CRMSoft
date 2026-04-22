'use client';

import { Avatar } from '../common/Avatar';
import { StarRating } from '../common/StarRating';
import { EngagementBar } from '../engagement/EngagementBar';
import { timeAgo } from '../../lib/formatters';
import type { FeedItem } from '../../services/marketplace.service';

interface FeedbackCardProps {
  item: FeedItem;
}

export function FeedbackCard({ item }: FeedbackCardProps) {
  const review = item.review;
  if (!review) return null;

  return (
    <article className="bg-white border-b border-gray-100">
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <Avatar name={item.authorName} src={item.authorAvatar} size={36} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-gray-900 truncate">{item.authorName}</p>
          <p className="text-xs text-gray-400">{timeAgo(item.createdAt)}</p>
        </div>
      </div>

      <div className="px-4 pb-3 space-y-2">
        <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
          <StarRating value={review.rating} size={18} />
          {review.title && <p className="font-semibold text-sm text-gray-900">{review.title}</p>}
          <p className="text-sm text-gray-700 leading-relaxed">{review.body}</p>
          {item.listing && (
            <p className="text-xs text-orange-500 font-medium">
              Review for: {item.listing.title}
            </p>
          )}
        </div>
      </div>

      <div className="px-4 pb-2">
        <EngagementBar item={item} />
      </div>
    </article>
  );
}

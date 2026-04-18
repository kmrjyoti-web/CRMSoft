'use client';

import { Search } from 'lucide-react';
import { Avatar } from '../common/Avatar';
import { EngagementBar } from '../engagement/EngagementBar';
import { timeAgo, formatINR } from '../../lib/formatters';
import type { FeedItem } from '../../services/marketplace.service';

interface RequirementCardProps {
  item: FeedItem;
}

export function RequirementCard({ item }: RequirementCardProps) {
  const req = item.requirement;
  if (!req) return null;

  return (
    <article className="bg-white border-b border-gray-100">
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <Avatar name={item.authorName} src={item.authorAvatar} size={36} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-gray-900 truncate">{item.authorName}</p>
          <p className="text-xs text-gray-400">{timeAgo(item.createdAt)}</p>
        </div>
        <span className="bg-purple-50 text-purple-600 text-xs font-medium px-2 py-0.5 rounded-full">
          Looking for
        </span>
      </div>

      <div className="mx-4 mb-3 bg-purple-50 border border-purple-100 rounded-2xl p-4 space-y-2">
        <div className="flex items-start gap-2">
          <Search size={16} className="text-purple-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-bold text-gray-900 text-sm">{req.title}</p>
            {req.description && (
              <p className="text-sm text-gray-600 mt-0.5">{req.description}</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-1">
          {req.category && (
            <span className="text-xs bg-white text-purple-600 border border-purple-200 px-2 py-0.5 rounded-lg">
              {req.category}
            </span>
          )}
          {req.quantity && (
            <span className="text-xs bg-white text-gray-600 border border-gray-200 px-2 py-0.5 rounded-lg">
              Qty: {req.quantity}
            </span>
          )}
          {req.budget && (
            <span className="text-xs bg-white text-green-600 border border-green-200 px-2 py-0.5 rounded-lg">
              Budget: {formatINR(req.budget)}
            </span>
          )}
        </div>
      </div>

      <div className="px-4 pb-2">
        <EngagementBar item={item} />
      </div>
    </article>
  );
}

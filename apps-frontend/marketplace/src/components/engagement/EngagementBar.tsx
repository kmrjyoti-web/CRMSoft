'use client';

import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';
import { formatShort } from '../../lib/formatters';
import type { FeedItem } from '../../services/marketplace.service';

interface EngagementBarProps {
  item: FeedItem;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onSave?: () => void;
}

export function EngagementBar({ item, onLike, onComment, onShare, onSave }: EngagementBarProps) {
  return (
    <div className="flex items-center gap-4 pt-1">
      <button
        onClick={onLike}
        className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${item.isLiked ? 'text-red-500' : 'text-gray-500'}`}
      >
        <Heart size={20} fill={item.isLiked ? '#ef4444' : 'none'} strokeWidth={1.8} />
        <span>{formatShort(item.likes)}</span>
      </button>
      <button
        onClick={onComment}
        className="flex items-center gap-1.5 text-sm font-medium text-gray-500"
      >
        <MessageCircle size={20} strokeWidth={1.8} />
        <span>{formatShort(item.comments)}</span>
      </button>
      <button
        onClick={onShare}
        className="flex items-center gap-1.5 text-sm font-medium text-gray-500"
      >
        <Share2 size={20} strokeWidth={1.8} />
      </button>
      <button
        onClick={onSave}
        className={`ml-auto flex items-center gap-1 text-sm ${item.isSaved ? 'text-orange-500' : 'text-gray-400'}`}
      >
        <Bookmark size={20} fill={item.isSaved ? '#f97316' : 'none'} strokeWidth={1.8} />
      </button>
    </div>
  );
}

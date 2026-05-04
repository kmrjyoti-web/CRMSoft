'use client';

import { useState } from 'react';
import { Avatar } from '../common/Avatar';
import { EngagementBar } from '../engagement/EngagementBar';
import { timeAgo } from '../../lib/formatters';
import type { FeedItem } from '../../services/marketplace.service';

interface PostCardProps {
  item: FeedItem;
}

export function PostCard({ item }: PostCardProps) {
  const [expanded, setExpanded] = useState(false);
  const text = item.content?.text ?? '';
  const images: string[] = item.content?.images ?? [];
  const isLong = text.length > 180;

  return (
    <article className="bg-white border-b border-gray-100">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <Avatar name={item.authorName} src={item.authorAvatar} size={40} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-gray-900 truncate">{item.authorName}</p>
          {item.authorBio && (
            <p className="text-xs text-gray-500 truncate">{item.authorBio}</p>
          )}
        </div>
        <span className="text-xs text-gray-400 shrink-0">{timeAgo(item.createdAt)}</span>
      </div>

      {/* Text */}
      {text && (
        <div className="px-4 pb-2">
          <p className="text-sm text-gray-800 leading-relaxed">
            {isLong && !expanded ? `${text.slice(0, 180)}...` : text}
          </p>
          {isLong && (
            <button
              className="text-xs text-orange-500 font-medium mt-0.5"
              onClick={() => setExpanded((e) => !e)}
            >
              {expanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      )}

      {/* Images */}
      {images.length > 0 && (
        <div className={`${images.length === 1 ? '' : 'grid grid-cols-2 gap-0.5'} overflow-hidden`}>
          {images.slice(0, 4).map((src, i) => (
            <div key={i} className="relative aspect-square bg-gray-100">
              <img src={src} alt="" className="w-full h-full object-cover" />
              {i === 3 && images.length > 4 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">+{images.length - 4}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tags */}
      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-4 pt-2">
          {item.tags.map((tag) => (
            <span key={tag} className="text-xs text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="px-4 pb-2 pt-1">
        <EngagementBar item={item} />
      </div>
    </article>
  );
}

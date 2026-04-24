'use client';

import { Tag } from 'lucide-react';
import { Avatar } from '../common/Avatar';
import { EngagementBar } from '../engagement/EngagementBar';
import { CountdownTimer } from '../offers/CountdownTimer';
import { RedemptionProgress } from '../offers/RedemptionProgress';
import { timeAgo } from '../../lib/formatters';
import type { FeedItem } from '../../services/marketplace.service';

interface OfferCardProps {
  item: FeedItem;
}

export function OfferCard({ item }: OfferCardProps) {
  const offer = item.offer;

  if (!offer) return null;

  return (
    <article className="bg-white border-b border-gray-100">
      {/* Author */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <Avatar name={item.authorName} src={item.authorAvatar} size={36} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-gray-900 truncate">{item.authorName}</p>
          <p className="text-xs text-gray-400">{timeAgo(item.createdAt)}</p>
        </div>
      </div>

      {/* Offer Banner */}
      <div className="mx-4 rounded-2xl overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            <Tag size={20} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-base leading-tight">{offer.title}</p>
            <p className="text-orange-100 text-sm mt-0.5">{offer.description}</p>
          </div>
        </div>

        {/* Code */}
        {offer.code && (
          <div className="bg-white/10 border border-white/30 rounded-xl px-3 py-2 flex items-center justify-between">
            <span className="text-white font-mono font-bold tracking-widest text-sm">{offer.code}</span>
            <span className="text-orange-100 text-xs">Tap to copy</span>
          </div>
        )}

        {/* Discount */}
        {offer.discountValue && (
          <div className="flex items-center gap-2">
            <span className="bg-white text-orange-600 font-bold text-lg px-3 py-1 rounded-xl">
              {offer.discountType === 'PERCENTAGE'
                ? `${offer.discountValue}% OFF`
                : `₹${offer.discountValue} OFF`}
            </span>
            {offer.minOrderValue && (
              <span className="text-orange-100 text-xs">on orders above ₹{offer.minOrderValue}</span>
            )}
          </div>
        )}
      </div>

      {/* Countdown + Progress */}
      <div className="px-4 pt-3 pb-1 space-y-2">
        {offer.expiresAt && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Expires in:</span>
            <CountdownTimer expiresAt={offer.expiresAt} />
          </div>
        )}
        {offer.maxRedemptions && offer.currentRedemptions !== undefined && (
          <RedemptionProgress current={offer.currentRedemptions} max={offer.maxRedemptions} />
        )}
      </div>

      <div className="px-4 pb-2 pt-1">
        <EngagementBar item={item} />
      </div>
    </article>
  );
}

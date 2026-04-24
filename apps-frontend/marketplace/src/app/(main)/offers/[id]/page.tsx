'use client';

import { useParams, useRouter } from 'next/navigation';
import { useOffer, useRedeemOffer } from '../../../../hooks/useOffers';
import { CountdownTimer } from '../../../../components/offers/CountdownTimer';
import { RedemptionProgress } from '../../../../components/offers/RedemptionProgress';
import { ShimmerCard } from '../../../../components/common/ShimmerCard';
import { ChevronLeft, Tag, Copy, CheckCircle } from 'lucide-react';
import { useState } from 'react';

export default function OfferDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: offer, isLoading } = useOffer(id);
  const redeem = useRedeemOffer();
  const [copied, setCopied] = useState(false);

  if (isLoading) return <div className="p-4"><ShimmerCard /></div>;
  if (!offer) return null;

  const handleCopy = () => {
    if (offer.code) {
      navigator.clipboard.writeText(offer.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 px-4 pt-4 pb-10">
        <button onClick={() => router.back()} className="text-white/80 mb-4 flex items-center gap-1">
          <ChevronLeft size={20} />
          <span className="text-sm">Back</span>
        </button>
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
            <Tag size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-xl leading-tight">{offer.title}</h1>
            {offer.description && (
              <p className="text-orange-100 text-sm mt-1">{offer.description}</p>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 -mt-6 space-y-4 pb-8">
        {/* Discount badge */}
        {offer.discountValue && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
            <span className="text-orange-500 font-bold text-3xl">
              {offer.discountType === 'PERCENTAGE' ? `${offer.discountValue}%` : `₹${offer.discountValue}`}
            </span>
            <div>
              <p className="font-semibold text-gray-900">Discount</p>
              {offer.minOrderValue && (
                <p className="text-xs text-gray-500">Min order: ₹{offer.minOrderValue}</p>
              )}
              {offer.maxDiscount && (
                <p className="text-xs text-gray-500">Max discount: ₹{offer.maxDiscount}</p>
              )}
            </div>
          </div>
        )}

        {/* Code */}
        {offer.code && (
          <button
            onClick={handleCopy}
            className="w-full bg-white rounded-2xl shadow-sm border border-dashed border-orange-300 p-4 flex items-center justify-between active:bg-orange-50"
          >
            <div>
              <p className="text-xs text-gray-500 text-left">Promo Code</p>
              <p className="font-mono font-bold text-gray-900 text-lg tracking-widest">{offer.code}</p>
            </div>
            {copied
              ? <CheckCircle size={20} className="text-green-500" />
              : <Copy size={20} className="text-orange-500" />
            }
          </button>
        )}

        {/* Expiry */}
        {offer.expiresAt && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <p className="text-xs text-gray-500 mb-1">Offer ends in</p>
            <CountdownTimer expiresAt={offer.expiresAt} />
          </div>
        )}

        {/* Redemption */}
        {offer.maxRedemptions && offer.currentRedemptions !== undefined && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <p className="text-xs text-gray-500 mb-2">Availability</p>
            <RedemptionProgress current={offer.currentRedemptions} max={offer.maxRedemptions} />
          </div>
        )}

        {/* Terms */}
        {offer.terms && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm font-semibold text-gray-900 mb-2">Terms & Conditions</p>
            <p className="text-sm text-gray-600 leading-relaxed">{offer.terms}</p>
          </div>
        )}

        <button
          onClick={() => redeem.mutate(offer.id)}
          disabled={redeem.isPending}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-200 disabled:opacity-60"
        >
          {redeem.isPending ? 'Redeeming...' : 'Redeem Offer'}
        </button>
      </div>
    </div>
  );
}

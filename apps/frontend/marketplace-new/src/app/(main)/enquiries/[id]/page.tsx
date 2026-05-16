'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEnquiry } from '../../../../hooks/useEnquiries';
import { ShimmerCard } from '../../../../components/common/ShimmerCard';
import { Avatar } from '../../../../components/common/Avatar';
import { ChevronLeft } from 'lucide-react';
import { timeAgo, formatINR } from '../../../../lib/formatters';

export default function EnquiryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: enq, isLoading } = useEnquiry(id);

  if (isLoading) return <div className="p-4"><ShimmerCard /></div>;
  if (!enq) return null;

  return (
    <div className="min-h-full">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white">
        <button onClick={() => router.back()}>
          <ChevronLeft size={22} className="text-gray-700" />
        </button>
        <h1 className="font-bold text-gray-900">Enquiry Detail</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Listing info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500 mb-1">For Product</p>
          <p className="font-semibold text-gray-900">{enq.listingTitle}</p>
          <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-2 ${
            enq.status === 'REPLIED' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
          }`}>
            {enq.status}
          </span>
        </div>

        {/* Your message */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500 mb-1">Your Message</p>
          <p className="text-sm text-gray-800 leading-relaxed">{enq.message}</p>
          <div className="flex gap-4 mt-2">
            {enq.quantity && (
              <p className="text-xs text-gray-500">Qty: <span className="font-medium">{enq.quantity}</span></p>
            )}
            {enq.targetPrice && (
              <p className="text-xs text-gray-500">Target: <span className="font-medium">{formatINR(enq.targetPrice)}</span></p>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1">{timeAgo(enq.createdAt)}</p>
        </div>

        {/* Seller reply */}
        {enq.reply && (
          <div className="bg-orange-50 rounded-2xl border border-orange-100 p-4">
            <p className="text-xs text-orange-600 font-medium mb-1">Seller Reply</p>
            <p className="text-sm text-gray-800 leading-relaxed">{enq.reply}</p>
          </div>
        )}
      </div>
    </div>
  );
}

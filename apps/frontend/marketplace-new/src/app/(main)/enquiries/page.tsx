'use client';

import Link from 'next/link';
import { useEnquiries } from '../../../hooks/useEnquiries';
import { ShimmerList } from '../../../components/common/ShimmerCard';
import { EmptyState } from '../../../components/common/EmptyState';
import { timeAgo } from '../../../lib/formatters';
import { MessageSquare } from 'lucide-react';

export default function EnquiriesPage() {
  const { data, isLoading } = useEnquiries();
  const enquiries = data?.pages.flatMap((p: any) => p.items ?? p.data?.items ?? []) ?? [];

  if (isLoading) return <ShimmerList count={4} />;
  if (!enquiries.length) {
    return (
      <EmptyState
        title="No enquiries yet"
        description="Send enquiries on products you're interested in"
      />
    );
  }

  return (
    <div className="p-4 space-y-3">
      {enquiries.map((enq) => (
        <Link key={enq.id} href={`/enquiries/${enq.id}`}>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex gap-3 active:bg-gray-50">
            <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
              <MessageSquare size={18} className="text-orange-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-900 truncate">{enq.listingTitle}</p>
              <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{enq.message}</p>
              <p className="text-xs text-gray-400 mt-1">{timeAgo(enq.createdAt)}</p>
            </div>
            <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full h-fit ${
              enq.status === 'REPLIED'
                ? 'bg-green-50 text-green-600'
                : 'bg-yellow-50 text-yellow-600'
            }`}>
              {enq.status}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}

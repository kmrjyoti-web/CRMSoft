'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Search } from 'lucide-react';
import { EmptyState } from '../../../components/common/EmptyState';
import { formatINR, timeAgo } from '../../../lib/formatters';

// Placeholder — hook to be wired when backend ready
function useRequirements() {
  return { data: { items: [] as any[] }, isLoading: false };
}

export default function RequirementsPage() {
  const router = useRouter();
  const { data, isLoading } = useRequirements();
  const items = data?.items ?? [];

  return (
    <div className="min-h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white sticky top-0 z-10">
        <h1 className="font-bold text-gray-900">Requirements</h1>
        <Link
          href="/requirements/new"
          className="flex items-center gap-1.5 bg-orange-500 text-white text-sm font-bold px-3 py-1.5 rounded-xl"
        >
          <Plus size={16} />
          Post
        </Link>
      </div>

      {isLoading ? (
        <div className="p-4">Loading...</div>
      ) : items.length === 0 ? (
        <EmptyState
          title="No requirements posted"
          description="Post what you're looking for and let vendors reach out"
          action={
            <button
              onClick={() => router.push('/requirements/new')}
              className="bg-orange-500 text-white text-sm font-bold px-5 py-2.5 rounded-xl"
            >
              Post Requirement
            </button>
          }
        />
      ) : (
        <div className="p-4 space-y-3">
          {items.map((req: any) => (
            <div key={req.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-3">
              <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center shrink-0">
                <Search size={18} className="text-purple-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900">{req.title}</p>
                <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{req.description}</p>
                <div className="flex gap-3 mt-1">
                  {req.quantity && (
                    <p className="text-xs text-gray-400">Qty: {req.quantity}</p>
                  )}
                  {req.budget && (
                    <p className="text-xs text-gray-400">Budget: {formatINR(req.budget)}</p>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">{timeAgo(req.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

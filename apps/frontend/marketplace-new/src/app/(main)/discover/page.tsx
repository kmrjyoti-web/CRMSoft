'use client';

import { useState } from 'react';
import { useListings } from '../../../hooks/useListings';
import { ProductCard } from '../../../components/feed/ProductCard';
import { ShimmerList } from '../../../components/common/ShimmerCard';
import { EmptyState } from '../../../components/common/EmptyState';
import { InfiniteScroll } from '../../../components/common/InfiniteScroll';
import { Search } from 'lucide-react';
import type { FeedItem } from '../../../services/marketplace.service';

const CATEGORIES = ['All', 'Electronics', 'Clothing', 'Food', 'Machinery', 'Pharma', 'Other'];

export default function DiscoverPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useListings({
    search: search || undefined,
    category: category || undefined,
  });

  const listings = data?.pages.flatMap((p) => p.items) ?? [];

  // Convert listings to FeedItem shape for ProductCard
  const feedItems: FeedItem[] = listings.map((l) => ({
    id: l.id,
    type: 'PRODUCT' as const,
    authorId: l.sellerId,
    authorName: l.sellerName,
    authorAvatar: l.sellerAvatar,
    createdAt: l.createdAt,
    likes: 0,
    comments: 0,
    saves: 0,
    isLiked: false,
    isSaved: false,
    listing: l,
  }));

  return (
    <div>
      {/* Search */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 space-y-2">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full rounded-xl bg-gray-100 pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-0.5">
          {CATEGORIES.map((cat) => {
            const val = cat === 'All' ? '' : cat;
            const active = category === val;
            return (
              <button
                key={cat}
                onClick={() => setCategory(val)}
                className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-medium border transition-colors ${
                  active
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {isLoading ? (
        <ShimmerList count={3} />
      ) : feedItems.length === 0 ? (
        <EmptyState title="No products found" description="Try a different search or category" />
      ) : (
        <div>
          {feedItems.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
          <InfiniteScroll
            onLoadMore={fetchNextPage}
            hasMore={!!hasNextPage}
            isLoading={isFetchingNextPage}
          />
        </div>
      )}
    </div>
  );
}

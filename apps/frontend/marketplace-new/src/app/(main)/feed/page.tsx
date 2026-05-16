'use client';

import { useFeed } from '../../../hooks/useFeed';
import { FeedCard } from '../../../components/feed/FeedCard';
import { ShimmerList } from '../../../components/common/ShimmerCard';
import { EmptyState } from '../../../components/common/EmptyState';
import { InfiniteScroll } from '../../../components/common/InfiniteScroll';

export default function FeedPage() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useFeed('ALL');

  const items = data?.pages.flatMap((p: any) => p.items ?? []) ?? [];

  if (isLoading) return <ShimmerList count={4} />;
  if (!items.length) return <EmptyState title="Nothing in your feed yet" description="Follow vendors and discover products to fill your feed" />;

  return (
    <div>
      {items.map((item: any) => (
        <FeedCard key={item.id} item={item} />
      ))}
      <InfiniteScroll
        onLoadMore={fetchNextPage}
        hasMore={!!hasNextPage}
        isLoading={isFetchingNextPage}
      />
    </div>
  );
}

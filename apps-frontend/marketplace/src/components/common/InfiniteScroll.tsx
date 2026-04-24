'use client';

import { useEffect, useRef } from 'react';

interface InfiniteScrollProps {
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading?: boolean;
  children?: React.ReactNode;
}

export function InfiniteScroll({ onLoadMore, hasMore, isLoading = false, children }: InfiniteScrollProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          onLoadMore();
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, isLoading, onLoadMore]);

  return (
    <>
      {children}
      <div ref={sentinelRef} aria-hidden="true" className="h-4" />
      {isLoading && (
        <div role="status" aria-label="Loading more items" className="flex justify-center py-4">
          <div aria-hidden="true" className="w-6 h-6 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
          <span className="sr-only">Loading more items</span>
        </div>
      )}
    </>
  );
}

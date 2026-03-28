'use client';

import { useEffect, useRef } from 'react';

interface InfiniteScrollProps {
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading?: boolean;
  loading?: boolean;
  children?: React.ReactNode;
}

export function InfiniteScroll({ onLoadMore, hasMore, isLoading, loading, children }: InfiniteScrollProps) {
  const busy = isLoading ?? loading ?? false;
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !busy) {
          onLoadMore();
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, busy, onLoadMore]);

  return (
    <>
      {children}
      <div ref={sentinelRef} className="h-4" />
      {busy && (
        <div className="flex justify-center py-4">
          <div className="w-6 h-6 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </>
  );
}

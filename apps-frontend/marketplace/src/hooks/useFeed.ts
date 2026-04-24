'use client';

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { feedService } from '../services/marketplace.service';
import { SEED_FEED } from '../lib/seed-data';

type FeedType = 'ALL' | 'POST' | 'PRODUCT' | 'OFFER' | 'LAUNCH' | 'FEEDBACK' | 'REQUIREMENT';

const SEED_PAGE = { items: SEED_FEED, meta: { total: SEED_FEED.length, page: 1, limit: 20 } };

export function useFeed(type: FeedType = 'ALL', category?: string) {
  return useInfiniteQuery({
    queryKey: ['feed', type, category],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const res = await feedService.getFeed(pageParam as number, type, category);
        const items = (res as any)?.data?.items ?? [];
        const meta = (res as any)?.data?.meta;
        // If API returns empty (no backend yet), fall back to seed
        if (!items.length && pageParam === 1) return SEED_PAGE;
        return { items, meta };
      } catch {
        // No backend running — serve seed data
        if (pageParam === 1) return SEED_PAGE;
        return { items: [], meta: null };
      }
    },
    getNextPageParam: (lastPage: any) => {
      const meta = lastPage?.meta;
      if (!meta) return undefined;
      return meta.page * meta.limit < meta.total ? meta.page + 1 : undefined;
    },
    initialPageParam: 1,
  });
}

export function useEngagePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, action }: { postId: string; action: 'LIKE' | 'SAVE' | 'SHARE' }) =>
      feedService.engage(postId, action),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['feed'] }),
  });
}

export function useFollow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, follow }: { userId: string; follow: boolean }) =>
      follow ? feedService.follow(userId) : feedService.unfollow(userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['feed'] }),
  });
}

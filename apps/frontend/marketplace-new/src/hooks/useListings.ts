'use client';

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { listingService } from '../services/marketplace.service';

export function useListings(params?: { search?: string; category?: string }) {
  return useInfiniteQuery({
    queryKey: ['listings', params],
    queryFn: ({ pageParam = 1 }) => listingService.list({ ...params, page: pageParam as number }),
    getNextPageParam: (lastPage: any) => {
      const meta = lastPage?.data?.meta;
      return meta && meta.page * meta.limit < meta.total ? meta.page + 1 : undefined;
    },
    select: (data) => ({
      pages: data.pages.map((p: any) => ({
        items: p?.data?.items ?? [],
        meta: p?.data?.meta,
      })),
      pageParams: data.pageParams,
    }),
    initialPageParam: 1,
  });
}

export function useListing(id: string) {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: () => listingService.getById(id).then((r: any) => r?.data as any),
    enabled: !!id,
  });
}

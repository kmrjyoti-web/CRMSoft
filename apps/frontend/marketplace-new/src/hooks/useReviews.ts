'use client';

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewService } from '../services/marketplace.service';

export function useReviews(listingId: string) {
  return useInfiniteQuery({
    queryKey: ['reviews', listingId],
    queryFn: ({ pageParam = 1 }) => reviewService.list(listingId, pageParam as number),
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
    enabled: !!listingId,
  });
}

export function useCreateReview(listingId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: reviewService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews', listingId] });
      qc.invalidateQueries({ queryKey: ['listing', listingId] });
    },
  });
}

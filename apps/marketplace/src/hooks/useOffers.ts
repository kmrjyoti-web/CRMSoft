'use client';

import { useInfiniteQuery, useQuery, useMutation } from '@tanstack/react-query';
import { offerService } from '../services/marketplace.service';

export function useOffers() {
  return useInfiniteQuery({
    queryKey: ['offers'],
    queryFn: ({ pageParam = 1 }) => offerService.list(pageParam as number),
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

export function useOffer(id: string) {
  return useQuery({
    queryKey: ['offer', id],
    queryFn: () => offerService.getById(id).then((r: any) => r?.data as any),
    enabled: !!id,
  });
}

export function useRedeemOffer() {
  return useMutation({
    mutationFn: offerService.redeem,
  });
}

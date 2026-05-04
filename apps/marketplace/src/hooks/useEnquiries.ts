'use client';

import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { enquiryService } from '../services/marketplace.service';

export function useEnquiries() {
  return useInfiniteQuery({
    queryKey: ['enquiries'],
    queryFn: ({ pageParam = 1 }) => enquiryService.list(pageParam as number),
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

export function useEnquiry(id: string) {
  return useQuery({
    queryKey: ['enquiry', id],
    queryFn: () => enquiryService.getById(id).then((r: any) => r?.data as any),
    enabled: !!id,
  });
}

export function useCreateEnquiry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: enquiryService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['enquiries'] }),
  });
}

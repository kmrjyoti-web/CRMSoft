'use client';

import { useQuery } from '@tanstack/react-query';
import { verticalsApi } from '@/lib/api/verticals';

export function useVerticals() {
  return useQuery({
    queryKey: ['verticals'],
    queryFn: () => verticalsApi.listAll(),
  });
}

export function useActiveVerticals() {
  return useQuery({
    queryKey: ['verticals', 'active'],
    queryFn: () => verticalsApi.findActive(),
  });
}

export function useBuiltVerticals() {
  return useQuery({
    queryKey: ['verticals', 'built'],
    queryFn: () => verticalsApi.findBuilt(),
  });
}

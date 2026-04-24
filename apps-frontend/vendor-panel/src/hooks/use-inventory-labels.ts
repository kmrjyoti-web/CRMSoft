'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryLabelsApi, type InventoryLabel } from '../lib/api/inventory-labels';

const KEY = 'inventory-labels';

export function useInventoryLabels() {
  return useQuery({
    queryKey: [KEY],
    queryFn: () => inventoryLabelsApi.list(),
  });
}

export function useUpsertInventoryLabel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<InventoryLabel>) => inventoryLabelsApi.upsert(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

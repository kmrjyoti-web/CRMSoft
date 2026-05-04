'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { webhooksApi } from '@/lib/api/webhooks-api';
import type { WebhookFilters } from '@/types/webhook';

export function useWebhooks(filters?: WebhookFilters) {
  return useQuery({
    queryKey: ['webhooks', filters],
    queryFn: () => webhooksApi.list(filters),
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useWebhookDeliveries(webhookId: string) {
  return useQuery({
    queryKey: ['webhook-deliveries', webhookId],
    queryFn: () => webhooksApi.getDeliveries(webhookId),
    enabled: !!webhookId,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useTestWebhook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (webhookId: string) => webhooksApi.test(webhookId),
    onSuccess: (_data, webhookId) => qc.invalidateQueries({ queryKey: ['webhook-deliveries', webhookId] }),
  });
}

export function useRetryDelivery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (deliveryId: string) => webhooksApi.retry(deliveryId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['webhook-deliveries'] }),
  });
}

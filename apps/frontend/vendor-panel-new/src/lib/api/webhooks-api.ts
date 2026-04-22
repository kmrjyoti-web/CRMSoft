import apiClient from './client';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { WebhookEndpoint, WebhookDelivery, WebhookFilters } from '@/types/webhook';

export const webhooksApi = {
  list: (filters?: WebhookFilters) =>
    apiClient.get<ApiResponse<PaginatedResponse<WebhookEndpoint>>>('/vendor/webhooks', { params: filters }).then((r) => r.data),

  getDeliveries: (webhookId: string) =>
    apiClient.get<ApiResponse<WebhookDelivery[]>>(`/vendor/webhooks/${webhookId}/deliveries`).then((r) => r.data),

  test: (webhookId: string) =>
    apiClient.post<ApiResponse<WebhookDelivery>>(`/vendor/webhooks/${webhookId}/test`).then((r) => r.data),

  retry: (deliveryId: string) =>
    apiClient.post<ApiResponse<WebhookDelivery>>(`/vendor/webhooks/deliveries/${deliveryId}/retry`).then((r) => r.data),
};

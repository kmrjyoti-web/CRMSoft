import apiClient from './client';
import type { TicketFilters } from '@/types/support-ticket';

export const supportApi = {
  getStats: () =>
    apiClient.get('/vendor/support/tickets/stats').then((r) => r.data),

  list: (filters?: TicketFilters) =>
    apiClient.get('/vendor/support/tickets', { params: filters }).then((r) => r.data),

  getById: (id: string) =>
    apiClient.get(`/vendor/support/tickets/${id}`).then((r) => r.data),

  update: (id: string, data: Record<string, unknown>) =>
    apiClient.patch(`/vendor/support/tickets/${id}`, data).then((r) => r.data),

  addMessage: (id: string, data: { message: string; attachments?: string[]; isInternal?: boolean }) =>
    apiClient.post(`/vendor/support/tickets/${id}/messages`, data).then((r) => r.data),

  getContext: (id: string) =>
    apiClient.get(`/vendor/support/tickets/${id}/context`).then((r) => r.data),
};

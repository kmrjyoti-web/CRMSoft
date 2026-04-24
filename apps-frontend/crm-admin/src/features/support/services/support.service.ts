import apiClient from '@/services/api-client';
import type { ApiResponse } from '@/types/api-response';
import type {
  SupportTicket,
  TicketMessage,
  CreateTicketPayload,
} from '../types/support.types';

const BASE = '/api/v1/support/tickets';

export function createTicket(payload: CreateTicketPayload) {
  return apiClient
    .post<ApiResponse<SupportTicket>>(BASE, payload)
    .then((r) => r.data);
}

export function getMyTickets(params?: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  return apiClient
    .get<ApiResponse<{ data: SupportTicket[]; meta: any }>>(BASE, { params })
    .then((r) => r.data);
}

export function getTicket(id: string) {
  return apiClient
    .get<ApiResponse<SupportTicket>>(`${BASE}/${id}`)
    .then((r) => r.data);
}

export function addMessage(
  ticketId: string,
  message: string,
  attachments?: string[],
) {
  return apiClient
    .post<ApiResponse<TicketMessage>>(`${BASE}/${ticketId}/messages`, {
      message,
      attachments,
    })
    .then((r) => r.data);
}

export function closeTicket(id: string) {
  return apiClient
    .post<ApiResponse<SupportTicket>>(`${BASE}/${id}/close`)
    .then((r) => r.data);
}

export function rateTicket(id: string, rating: number, comment?: string) {
  return apiClient
    .post<ApiResponse<SupportTicket>>(`${BASE}/${id}/rate`, {
      rating,
      comment,
    })
    .then((r) => r.data);
}

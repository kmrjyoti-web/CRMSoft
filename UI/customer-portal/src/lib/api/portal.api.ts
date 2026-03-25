import apiClient from './client';
import type { ApiResponse, Paginated } from '@/types/api';
import type {
  LoginResponse,
  PortalDashboard,
  PortalDocument,
  PortalInvoice,
  PortalOrder,
  PortalPayment,
  PortalRoute,
  PortalSupportTicket,
  PortalUser,
} from '@/types/portal';

export const portalAuthApi = {
  login: (email: string, password: string) =>
    apiClient
      .post<ApiResponse<LoginResponse>>('/portal/login', { email, password })
      .then((r) => r.data),

  forgotPassword: (email: string) =>
    apiClient
      .post<ApiResponse<{ message: string }>>('/portal/forgot-password', { email })
      .then((r) => r.data),

  resetPassword: (token: string, newPassword: string) =>
    apiClient
      .post<ApiResponse<{ message: string }>>('/portal/reset-password', { token, newPassword })
      .then((r) => r.data),

  getMe: () =>
    apiClient.get<ApiResponse<PortalUser>>('/portal/me').then((r) => r.data),

  getRoutes: () =>
    apiClient.get<ApiResponse<PortalRoute[]>>('/portal/routes').then((r) => r.data),
};

export const portalDataApi = {
  getDashboard: () =>
    apiClient.get<ApiResponse<PortalDashboard>>('/portal/dashboard').then((r) => r.data),

  getInvoices: (page = 1, limit = 20) =>
    apiClient
      .get<ApiResponse<Paginated<PortalInvoice>>>('/portal/invoices', { params: { page, limit } })
      .then((r) => r.data),

  getInvoice: (id: string) =>
    apiClient.get<ApiResponse<PortalInvoice>>(`/portal/invoices/${id}`).then((r) => r.data),

  getPayments: (page = 1, limit = 20) =>
    apiClient
      .get<ApiResponse<Paginated<PortalPayment>>>('/portal/payments', { params: { page, limit } })
      .then((r) => r.data),

  getOrders: (page = 1, limit = 20) =>
    apiClient
      .get<ApiResponse<Paginated<PortalOrder>>>('/portal/orders', { params: { page, limit } })
      .then((r) => r.data),

  getSupportTickets: (page = 1, limit = 20) =>
    apiClient
      .get<ApiResponse<Paginated<PortalSupportTicket>>>('/portal/support', {
        params: { page, limit },
      })
      .then((r) => r.data),

  createSupportTicket: (data: { subject: string; description: string; priority: string }) =>
    apiClient
      .post<ApiResponse<PortalSupportTicket>>('/portal/support', data)
      .then((r) => r.data),

  getDocuments: (page = 1, limit = 20) =>
    apiClient
      .get<ApiResponse<Paginated<PortalDocument>>>('/portal/documents', {
        params: { page, limit },
      })
      .then((r) => r.data),

  updateProfile: (data: { displayName?: string; phone?: string }) =>
    apiClient.patch<ApiResponse<PortalUser>>('/portal/me', data).then((r) => r.data),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiClient
      .post<ApiResponse<{ message: string }>>('/portal/me/change-password', {
        currentPassword,
        newPassword,
      })
      .then((r) => r.data),
};

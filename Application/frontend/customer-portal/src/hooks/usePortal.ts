import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { portalDataApi } from '@/lib/api/portal.api';

export const PORTAL_KEYS = {
  dashboard: ['portal', 'dashboard'] as const,
  invoices: (page: number) => ['portal', 'invoices', page] as const,
  payments: (page: number) => ['portal', 'payments', page] as const,
  orders: (page: number) => ['portal', 'orders', page] as const,
  support: (page: number) => ['portal', 'support', page] as const,
  documents: (page: number) => ['portal', 'documents', page] as const,
};

export function usePortalDashboard() {
  return useQuery({
    queryKey: PORTAL_KEYS.dashboard,
    queryFn: () => portalDataApi.getDashboard().then((r) => r.data),
  });
}

export function usePortalInvoices(page = 1) {
  return useQuery({
    queryKey: PORTAL_KEYS.invoices(page),
    queryFn: () => portalDataApi.getInvoices(page).then((r) => r.data),
  });
}

export function usePortalPayments(page = 1) {
  return useQuery({
    queryKey: PORTAL_KEYS.payments(page),
    queryFn: () => portalDataApi.getPayments(page).then((r) => r.data),
  });
}

export function usePortalOrders(page = 1) {
  return useQuery({
    queryKey: PORTAL_KEYS.orders(page),
    queryFn: () => portalDataApi.getOrders(page).then((r) => r.data),
  });
}

export function usePortalSupport(page = 1) {
  return useQuery({
    queryKey: PORTAL_KEYS.support(page),
    queryFn: () => portalDataApi.getSupportTickets(page).then((r) => r.data),
  });
}

export function useCreateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { subject: string; description: string; priority: string }) =>
      portalDataApi.createSupportTicket(data).then((r) => r.data),
    onSuccess: () => {
      toast.success('Support ticket created');
      qc.invalidateQueries({ queryKey: ['portal', 'support'] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message ?? 'Failed to create ticket');
    },
  });
}

export function usePortalDocuments(page = 1) {
  return useQuery({
    queryKey: PORTAL_KEYS.documents(page),
    queryFn: () => portalDataApi.getDocuments(page).then((r) => r.data),
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { displayName?: string; phone?: string }) =>
      portalDataApi.updateProfile(data).then((r) => r.data),
    onSuccess: () => {
      toast.success('Profile updated');
      qc.invalidateQueries({ queryKey: ['portal', 'me'] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message ?? 'Failed to update profile');
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      portalDataApi.changePassword(currentPassword, newPassword).then((r) => r.data),
    onSuccess: () => {
      toast.success('Password changed successfully');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message ?? 'Failed to change password');
    },
  });
}

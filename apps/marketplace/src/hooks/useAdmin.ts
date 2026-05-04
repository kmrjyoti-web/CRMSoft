import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/admin.service';

// --- Vendors ---

export function useVendors(params?: { page?: number; status?: string; search?: string }) {
  return useQuery({
    queryKey: ['admin', 'vendors', params],
    queryFn: () => adminService.listVendors(params),
    select: (res) => res.data,
  });
}

export function useApproveVendor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminService.approveVendor(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'vendors'] }),
  });
}

export function useSuspendVendor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminService.suspendVendor(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'vendors'] }),
  });
}

// --- Modules ---

export function useAdminModules(params?: { page?: number; status?: string; search?: string }) {
  return useQuery({
    queryKey: ['admin', 'modules', params],
    queryFn: () => adminService.listModules(params),
    select: (res) => res.data,
  });
}

export function usePublishModule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminService.publishModule(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'modules'] }),
  });
}

import { api } from './api';

export interface Vendor {
  id: string;
  companyName: string;
  contactEmail: string;
  gstNumber?: string;
  revenueSharePct?: number;
  status: 'PENDING' | 'APPROVED' | 'SUSPENDED';
  createdAt: string;
  updatedAt: string;
}

export interface MarketplaceModule {
  id: string;
  moduleCode: string;
  moduleName: string;
  category: string;
  shortDescription: string;
  status: 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'REJECTED';
  vendorId: string;
  vendor?: { companyName: string };
  version?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminStats {
  vendors: { total: number; pending: number; approved: number; suspended: number };
  modules: { total: number; draft: number; review: number; published: number };
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export const adminService = {
  // Vendors
  listVendors(params?: { page?: number; limit?: number; status?: string; search?: string }) {
    const q = new URLSearchParams({ page: String(params?.page ?? 1), limit: String(params?.limit ?? 20) });
    if (params?.status) q.set('status', params.status);
    if (params?.search) q.set('search', params.search);
    return api.get<{ data: PagedResult<Vendor> }>(`/marketplace/vendors?${q}`);
  },

  getVendor(id: string) {
    return api.get<{ data: Vendor }>(`/marketplace/vendors/${id}`);
  },

  approveVendor(id: string) {
    return api.put<{ data: Vendor }>(`/marketplace/vendors/${id}/approve`);
  },

  suspendVendor(id: string) {
    return api.put<{ data: Vendor }>(`/marketplace/vendors/${id}/suspend`);
  },

  // Modules (admin publish)
  publishModule(id: string) {
    return api.put<{ data: MarketplaceModule }>(`/marketplace/vendors/modules/${id}/publish`);
  },

  // Modules pending review — reuse the main listing with status filter
  listModules(params?: { page?: number; limit?: number; status?: string; search?: string }) {
    const q = new URLSearchParams({ page: String(params?.page ?? 1), limit: String(params?.limit ?? 20) });
    if (params?.status) q.set('status', params.status);
    if (params?.search) q.set('search', params.search);
    return api.get<{ data: PagedResult<MarketplaceModule> }>(`/marketplace/modules?${q}`);
  },
};

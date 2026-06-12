export interface TenantItem {
  id: string;
  name: string;
  slug: string;
  status: string;
  planName: string;
  usersCount: number;
  storageUsedMb: number;
  storageMaxMb: number;
  dbStrategy: string;
  industryCode?: string | null;
  lastActiveAt: string;
  createdAt: string;
}

export interface TenantFilters {
  status?: string;
  search?: string;
  planName?: string;
  industryCode?: string;
  page?: number;
  limit?: number;
}

export interface TenantDetail extends TenantItem {
  modules: { name: string; status: string }[];
  licenseKey?: string;
  billingHistory: { date: string; amount: number; status: string }[];
}

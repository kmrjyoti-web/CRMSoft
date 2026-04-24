export type LicenseStatus = 'ACTIVE' | 'EXPIRED' | 'TRIAL' | 'SUSPENDED' | 'CANCELLED';

export interface License {
  id: string;
  tenantId: string;
  tenantName: string;
  tenantEmail: string;
  packageId: string;
  packageName: string;
  licenseKey: string;
  status: LicenseStatus;
  startDate: string;
  expiryDate: string;
  maxUsers: number;
  currentUsers: number;
  maxStorage: number;
  usedStorage: number;
  autoRenew: boolean;
  lastRenewalDate?: string;
  nextBillingDate?: string;
  totalPaid: number;
  tenantIndustryCode?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LicenseFilters {
  search?: string;
  status?: LicenseStatus;
  packageId?: string;
  industryCode?: string;
  page?: number;
  limit?: number;
}

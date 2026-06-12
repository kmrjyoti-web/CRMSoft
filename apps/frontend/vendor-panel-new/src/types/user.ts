export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  tenantId?: string;
  verificationStatus: 'UNVERIFIED' | 'PARTIALLY_VERIFIED' | 'FULLY_VERIFIED';
  emailVerified: boolean;
  mobileVerified: boolean;
  gstVerified: boolean;
  registrationType: 'INDIVIDUAL' | 'BUSINESS';
  createdAt: string;
}

export interface Vendor {
  id: string;
  tenantId?: string;
  companyName: string;
  contactEmail: string;
  gstNumber?: string;
  status: 'PENDING' | 'APPROVED' | 'SUSPENDED';
  revenueSharePct?: number;
  logo?: string;
  enabledModules?: string[];
  packageName?: string;
  createdAt?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user: User;
  vendor?: Vendor;
  tenantId: string;
}

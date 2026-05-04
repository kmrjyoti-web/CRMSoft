export type PartnerStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED';
export type PartnerType = 'RESELLER' | 'REFERRAL' | 'AFFILIATE' | 'STRATEGIC';

export interface Partner {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company: string;
  type: PartnerType;
  status: PartnerStatus;
  commissionRate: number;
  totalEarnings: number;
  pendingPayout: number;
  referralCount: number;
  conversionCount: number;
  gstin?: string;
  pan?: string;
  bankAccount?: string;
  ifscCode?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePartnerDto {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  type: PartnerType;
  commissionRate?: number;
  gstin?: string;
  pan?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export interface PartnerFilters {
  search?: string;
  status?: PartnerStatus;
  type?: PartnerType;
  page?: number;
  limit?: number;
}

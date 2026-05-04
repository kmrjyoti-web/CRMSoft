export interface AgencyDiscount {
  id: string;
  agentName: string;
  agentType: 'AGENT' | 'DISTRIBUTOR' | 'DEALER';
  discountPercent: number;
  applicableOn: 'ALL' | 'CATEGORY' | 'PRODUCT';
  validFrom?: string;
  validTo?: string;
  isActive: boolean;
}

export interface ItemDiscount {
  id: string;
  productName: string;
  productCode: string;
  discountType: 'FLAT' | 'PERCENT' | 'SLAB';
  discountValue: number;
  minQty?: number;
  maxQty?: number;
  validFrom?: string;
  validTo?: string;
  isActive: boolean;
}

export interface Promotion {
  id: string;
  name: string;
  promotionType: 'SEASONAL' | 'BUNDLE' | 'COMBO' | 'CLEARANCE' | 'LOYALTY';
  discountPercent?: number;
  discountFlat?: number;
  minOrderValue?: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  description?: string;
}

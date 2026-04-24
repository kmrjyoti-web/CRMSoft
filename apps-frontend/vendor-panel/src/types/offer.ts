export type OfferType = 'TRIAL_EXTENSION' | 'DISCOUNT_PERCENTAGE' | 'DISCOUNT_FLAT' | 'BONUS_TOKENS' | 'FREE_UPGRADE';

export interface SoftwareOffer {
  id: string;
  name: string;
  code: string;
  description: string | null;
  offerType: OfferType;
  value: number;
  applicablePlanIds: string[];
  validFrom: string;
  validTo: string;
  maxRedemptions: number;
  currentRedemptions: number;
  isActive: boolean;
  autoApply: boolean;
  terms: string | null;
  industryCode?: string | null;
  createdAt: string;
}

export interface OfferCreateData {
  name: string;
  code: string;
  offerType: OfferType;
  value: number;
  validFrom: string;
  validTo: string;
  description?: string;
  applicablePlanIds?: string[];
  maxRedemptions?: number;
  autoApply?: boolean;
  terms?: string;
  industryCode?: string;
}

export type Offer = SoftwareOffer;

export interface OfferFilters {
  search?: string;
  isActive?: boolean;
  industryCode?: string;
  page?: number;
  limit?: number;
}

export type ListingType = 'PRODUCT' | 'SERVICE' | 'NEW_LAUNCH' | 'LAUNCHING_OFFER' | 'REQUIREMENT' | 'JOB' | 'OTHER';
export type ListingStatus = 'LST_DRAFT' | 'LST_SCHEDULED' | 'LST_ACTIVE' | 'LST_EXPIRED' | 'LST_SOLD_OUT' | 'LST_DEACTIVATED' | 'LST_ARCHIVED';
export type VisibilityType = 'VIS_PUBLIC' | 'VIS_GEO_TARGETED' | 'VIS_VERIFIED_ONLY' | 'VIS_MY_CONTACTS' | 'VIS_SELECTED_CONTACTS' | 'VIS_CATEGORY_BASED' | 'VIS_GRADE_BASED';

export interface Listing {
  id: string;
  tenantId: string;
  vendorId: string;
  listingType: ListingType;
  status: ListingStatus;
  title: string;
  slug?: string;
  shortDescription?: string;
  description?: string;
  category?: string;
  subcategory?: string;
  tags: string[];
  mediaUrls: string[];
  b2cPrice: number;
  compareAtPrice?: number;
  b2bEnabled: boolean;
  b2bTiers: PriceTier[];
  visibility: VisibilityType;
  moq?: number;
  stockAvailable?: number;
  shippingConfig?: Record<string, unknown>;
  attributes?: Record<string, unknown>;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  publishAt?: string;
  expiresAt?: string;
  viewCount: number;
  enquiryCount: number;
  orderCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PriceTier {
  id: string;
  listingId: string;
  minQty: number;
  maxQty?: number;
  pricePerUnit: number;
  customerGrade?: string;
}

export interface CreateListingDto {
  listingType: ListingType;
  title: string;
  shortDescription?: string;
  description?: string;
  category?: string;
  subcategory?: string;
  tags?: string[];
  mediaUrls?: string[];
  b2cPrice: number;
  compareAtPrice?: number;
  b2bEnabled?: boolean;
  b2bTiers?: Omit<PriceTier, 'id' | 'listingId'>[];
  visibility?: VisibilityType;
  moq?: number;
  stockAvailable?: number;
  shippingConfig?: Record<string, unknown>;
  attributes?: Record<string, unknown>;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  publishAt?: string;
  expiresAt?: string;
}

export interface ListingFilters {
  type?: ListingType;
  status?: ListingStatus;
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

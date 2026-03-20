// ---------------------------------------------------------------------------
// Marketplace Types — Combined (original module/vendor + new listing/offer/review admin)
// ---------------------------------------------------------------------------

// ── Original module marketplace types ──────────────────────────────────────

export interface MarketplaceModule {
  id: string;
  code: string;
  name: string;
  description: string;
  shortDescription?: string;
  category: string;
  icon?: string;
  bannerUrl?: string;
  screenshotUrls?: string[];
  version: string;
  price: number;
  currency: string;
  pricingModel: "FREE" | "ONE_TIME" | "MONTHLY" | "YEARLY";
  trialDays?: number;
  isFeatured: boolean;
  isPublished: boolean;
  avgRating?: number;
  reviewCount?: number;
  installCount?: number;
  vendorId: string;
  vendorName?: string;
  status: "DRAFT" | "SUBMITTED" | "PUBLISHED" | "REJECTED" | "ARCHIVED";
  createdAt: string;
  updatedAt: string;
}

export interface InstalledModule {
  id: string;
  moduleId: string;
  moduleName: string;
  moduleCode: string;
  status: "TRIAL" | "ACTIVE" | "EXPIRED" | "CANCELLED";
  installedAt: string;
  trialEndsAt?: string;
  subscriptionEndsAt?: string;
}

export interface MarketplaceVendor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  website?: string;
  description?: string;
  logoUrl?: string;
  status: "PENDING" | "APPROVED" | "SUSPENDED";
  tenantId: string;
  moduleCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface MarketplaceOrder {
  id: string;
  orderNumber: string;
  listingId: string;
  listingTitle: string;
  buyerName: string;
  vendorName: string;
  amount: number;
  currency: string;
  status: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  trackingNumber?: string;
  trackingUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EnquiryReply {
  id: string;
  message: string;
  authorName: string;
  createdAt: string;
}

// ── Enums for admin panel ───────────────────────────────────────────────────

export type ListingType = 'PRODUCT' | 'SERVICE' | 'REQUIREMENT' | 'JOB';
export type ListingStatus = 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'PAUSED' | 'SOLD_OUT' | 'EXPIRED' | 'ARCHIVED' | 'REJECTED';
export type PostType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'PRODUCT_SHARE' | 'CUSTOMER_FEEDBACK' | 'PRODUCT_LAUNCH' | 'POLL' | 'ANNOUNCEMENT';
export type PostStatus = 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'HIDDEN' | 'ARCHIVED' | 'DELETED';
export type OfferType = 'ONE_TIME' | 'DAILY_RECURRING' | 'WEEKLY_RECURRING' | 'FIRST_N_ORDERS' | 'LAUNCH' | 'CUSTOM';
export type DiscountType = 'PERCENTAGE' | 'FLAT_AMOUNT' | 'FREE_SHIPPING' | 'BUY_X_GET_Y' | 'BUNDLE_PRICE';
export type OfferStatus = 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'PAUSED' | 'EXPIRED' | 'CLOSED' | 'ARCHIVED';
export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'FLAGGED';
export type VisibilityType = 'PUBLIC' | 'GEO_TARGETED' | 'VERIFIED_ONLY' | 'MY_CONTACTS' | 'SELECTED_CONTACTS' | 'CATEGORY_BASED' | 'GRADE_BASED';

// ── Admin listing (extended) ────────────────────────────────────────────────

export interface MarketplaceListing {
  id: string;
  tenantId: string;
  authorId: string;
  listingType: ListingType;
  categoryId?: string;
  subcategoryId?: string;
  title: string;
  description?: string;
  shortDescription?: string;
  mediaUrls: { type: 'IMAGE' | 'VIDEO'; url: string; thumbnail?: string }[];
  currency: string;
  basePrice: number; // paisa
  mrp?: number;
  minOrderQty: number;
  maxOrderQty?: number;
  hsnCode?: string;
  gstRate?: number;
  trackInventory: boolean;
  stockAvailable: number;
  stockReserved: number;
  visibility: VisibilityType;
  status: ListingStatus;
  publishAt?: string;
  expiresAt?: string;
  publishedAt?: string;
  viewCount: number;
  enquiryCount: number;
  orderCount: number;
  reviewCount: number;
  avgRating?: number;
  isFeatured: boolean;
  slug?: string;
  keywords: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Admin post (extended) ───────────────────────────────────────────────────

export interface MarketplacePost {
  id: string;
  tenantId: string;
  authorId: string;
  postType: PostType;
  content?: string;
  mediaUrls: { type: 'IMAGE' | 'VIDEO'; url: string; thumbnail?: string }[];
  linkedListingId?: string;
  linkedOfferId?: string;
  rating?: number;
  visibility: VisibilityType;
  status: PostStatus;
  publishAt?: string;
  expiresAt?: string;
  publishedAt?: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  saveCount: number;
  hashtags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Offer conditions ────────────────────────────────────────────────────────

export interface OfferConditions {
  geographic?: { pincodes?: string[]; cities?: string[]; states?: string[] };
  customerGroup?: { grades?: string[]; categories?: string[]; verifiedOnly?: boolean };
  orderBased?: { firstN?: number; minOrderQty?: number; maxOrderQty?: number; minOrderValue?: number };
  timeBased?: {
    type: 'ONE_TIME' | 'RECURRING';
    startAt?: string;
    endAt?: string;
    cronExpression?: string;
    duration?: { value: number; unit: 'HOURS' | 'MINUTES' | 'DAYS' };
    resetTime?: string;
    activeDays?: number[];
  };
}

// ── Admin offer ─────────────────────────────────────────────────────────────

export interface MarketplaceOffer {
  id: string;
  tenantId: string;
  authorId: string;
  title: string;
  description?: string;
  mediaUrls: unknown[];
  offerType: OfferType;
  discountType: DiscountType;
  discountValue: number;
  linkedListingIds: string[];
  linkedCategoryIds: string[];
  primaryListingId?: string;
  conditions: OfferConditions;
  maxRedemptions?: number;
  currentRedemptions: number;
  autoCloseOnLimit: boolean;
  resetTime?: string;
  status: OfferStatus;
  publishAt?: string;
  expiresAt?: string;
  publishedAt?: string;
  closedAt?: string;
  closedReason?: string;
  impressionCount: number;
  clickCount: number;
  enquiryCount: number;
  leadCount: number;
  orderCount: number;
  totalOrderValue: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Admin review ────────────────────────────────────────────────────────────

export interface MarketplaceReview {
  id: string;
  tenantId: string;
  listingId: string;
  reviewerId: string;
  rating: number;
  title?: string;
  body?: string;
  mediaUrls: unknown[];
  isVerifiedPurchase: boolean;
  orderId?: string;
  status: ReviewStatus;
  moderatorId?: string;
  moderationNote?: string;
  helpfulCount: number;
  reportCount: number;
  sellerResponse?: string;
  sellerRespondedAt?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Enquiry (extended) ──────────────────────────────────────────────────────

export interface MarketplaceEnquiry {
  id: string;
  tenantId: string;
  listingId: string;
  enquirerId: string;
  message: string;
  quantity?: number;
  expectedPrice?: number;
  deliveryPincode?: string;
  crmLeadId?: string;
  status: string;
  isDeleted: boolean;
  replies?: EnquiryReply[];
  createdAt: string;
  updatedAt: string;
}

// ── Analytics ──────────────────────────────────────────────────────────────

export interface AnalyticsSummary {
  id: string;
  tenantId: string;
  entityType: 'POST' | 'LISTING' | 'OFFER';
  entityId: string;
  impressions: number;
  uniqueImpressions: number;
  clicks: number;
  uniqueClicks: number;
  ctr: number;
  enquiries: number;
  enquiryRate: number;
  leads: number;
  leadConversionRate: number;
  orders: number;
  orderConversionRate: number;
  totalOrderValue: number;
  topCities: { city: string; count: number }[];
  topStates: { state: string; count: number }[];
  peakHours: { hour: number; count: number }[];
  deviceBreakdown: Record<string, number>;
  sourceBreakdown: Record<string, number>;
  lastComputedAt: string;
}

export interface RequirementQuote {
  id: string;
  requirementId: string;
  sellerId: string;
  tenantId: string;
  pricePerUnit: number;
  quantity: number;
  deliveryDays: number;
  creditDays?: number;
  notes?: string;
  certifications: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

// ── DTOs ───────────────────────────────────────────────────────────────────

export interface RegisterVendorDto {
  name: string;
  email: string;
  phone?: string;
  website?: string;
  description?: string;
}

export interface CreateModuleDto {
  name: string;
  code: string;
  description: string;
  shortDescription?: string;
  category: string;
  version: string;
  price: number;
  currency: string;
  pricingModel: "FREE" | "ONE_TIME" | "MONTHLY" | "YEARLY";
  trialDays?: number;
}

export interface CreateListingDto {
  listingType: ListingType;
  title: string;
  description?: string;
  shortDescription?: string;
  categoryId?: string;
  basePrice: number;
  mrp?: number;
  currency?: string;
  hsnCode?: string;
  gstRate?: number;
  stockAvailable?: number;
  visibility?: VisibilityType;
  keywords?: string[];
  attributes?: Record<string, unknown>;
}

export interface CreateOfferDto {
  title: string;
  description?: string;
  offerType: OfferType;
  discountType: DiscountType;
  discountValue: number;
  linkedListingIds?: string[];
  linkedCategoryIds?: string[];
  primaryListingId?: string;
  conditions?: OfferConditions;
  maxRedemptions?: number;
  autoCloseOnLimit?: boolean;
  resetTime?: string;
  publishAt?: string;
  expiresAt?: string;
}

export interface CreateReviewDto {
  listingId: string;
  rating: number;
  title?: string;
  body?: string;
  orderId?: string;
}

export interface CreatePostDto {
  postType: PostType;
  content?: string;
  linkedListingId?: string;
  linkedOfferId?: string;
  visibility?: VisibilityType;
  hashtags?: string[];
  publishAt?: string;
}

export interface CreateOrderDto {
  listingId: string;
  quantity?: number;
}

export interface UpdateOrderStatusDto {
  status: "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
}

export interface UpdateTrackingDto {
  trackingNumber: string;
  trackingUrl?: string;
}

export interface CreateEnquiryDto {
  listingId?: string;
  message: string;
}

export interface ReplyEnquiryDto {
  message: string;
}

// ── List params ────────────────────────────────────────────────────────────

export interface MarketplaceFilters {
  search?: string;
  category?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface ListingListParams {
  page?: number;
  limit?: number;
  status?: ListingStatus;
  listingType?: ListingType;
  categoryId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface OfferListParams {
  page?: number;
  limit?: number;
  status?: OfferStatus;
  offerType?: OfferType;
  search?: string;
}

export interface ReviewListParams {
  page?: number;
  limit?: number;
  status?: ReviewStatus;
  listingId?: string;
}

export interface PostListParams {
  page?: number;
  limit?: number;
  status?: PostStatus;
  postType?: PostType;
  search?: string;
}

// ── Dashboard stats ────────────────────────────────────────────────────────

export interface MarketplaceDashboardStats {
  activeListings: number;
  activePosts: number;
  activeOffers: number;
  pendingReviews: number;
  totalEnquiries: number;
  totalOrders: number;
  totalRevenue: number; // paisa
  topPosts: MarketplacePost[];
  topListings: MarketplaceListing[];
  funnel: {
    impressions: number;
    clicks: number;
    enquiries: number;
    leads: number;
    orders: number;
  };
  revenueByOfferType: { offerType: string; revenue: number }[];
}

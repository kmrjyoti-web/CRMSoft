// ---------------------------------------------------------------------------
// Marketplace Types
// ---------------------------------------------------------------------------

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

export interface MarketplaceListing {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  images?: string[];
  vendorId: string;
  vendorName?: string;
  status: "DRAFT" | "ACTIVE" | "SOLD" | "EXPIRED";
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MarketplacePost {
  id: string;
  content: string;
  imageUrls?: string[];
  authorId: string;
  authorName?: string;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  isLiked?: boolean;
  isSaved?: boolean;
  createdAt: string;
}

export interface MarketplaceEnquiry {
  id: string;
  listingId?: string;
  listingTitle?: string;
  buyerName: string;
  buyerEmail: string;
  message: string;
  status: "OPEN" | "REPLIED" | "CLOSED";
  replies?: EnquiryReply[];
  createdAt: string;
}

export interface EnquiryReply {
  id: string;
  message: string;
  authorName: string;
  createdAt: string;
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

export interface MarketplaceReview {
  id: string;
  moduleId: string;
  userId: string;
  userName?: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

// DTOs
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
  title: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  location?: string;
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

export interface CreateReviewDto {
  rating: number;
  comment?: string;
}

export interface CreateEnquiryDto {
  listingId?: string;
  message: string;
}

export interface ReplyEnquiryDto {
  message: string;
}

export interface CreatePostDto {
  content: string;
  imageUrls?: string[];
}

export interface MarketplaceFilters {
  search?: string;
  category?: string;
  status?: string;
  page?: number;
  limit?: number;
}

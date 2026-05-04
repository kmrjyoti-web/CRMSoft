import { api } from './api';

// ── Types ──────────────────────────────────────────────────────────────────

export interface Listing {
  id: string;
  title: string;
  description?: string;
  price?: number;
  mrp?: number;
  currency?: string;
  images?: string[];
  sellerId: string;
  sellerName: string;
  sellerAvatar?: string;
  category?: string;
  unit?: string;
  minOrder?: number;
  stock?: number;
  tags?: string[];
  averageRating?: number;
  reviewCount?: number;
  createdAt: string;
}

export interface Offer {
  id: string;
  title: string;
  description?: string;
  code?: string;
  discountType: 'PERCENTAGE' | 'FLAT';
  discountValue?: number;
  minOrderValue?: number;
  maxDiscount?: number;
  maxRedemptions?: number;
  currentRedemptions?: number;
  expiresAt?: string;
  terms?: string;
  listing?: Listing;
}

export interface Review {
  id: string;
  listingId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar?: string;
  rating: number;
  title?: string;
  body: string;
  createdAt: string;
}

export interface Requirement {
  id: string;
  title: string;
  description?: string;
  category?: string;
  quantity?: number;
  budget?: number;
  authorId: string;
  authorName: string;
  status: string;
  createdAt: string;
}

export interface FeedItem {
  id: string;
  type: 'POST' | 'PRODUCT' | 'OFFER' | 'LAUNCH' | 'FEEDBACK' | 'REQUIREMENT';
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorBio?: string;
  content?: { text?: string; images?: string[] };
  tags?: string[];
  listing?: Listing;
  offer?: Offer;
  review?: Review;
  requirement?: Requirement;
  likes: number;
  comments: number;
  saves: number;
  isLiked?: boolean;
  isSaved?: boolean;
  createdAt: string;
}

export interface Enquiry {
  id: string;
  listingId: string;
  listingTitle?: string;
  message: string;
  quantity?: number;
  targetPrice?: number;
  status: 'PENDING' | 'REPLIED' | 'CLOSED';
  reply?: string;
  createdAt: string;
}

interface PagedResult<T> {
  items: T[];
  meta: { total: number; page: number; limit: number };
}

// ── Feed ───────────────────────────────────────────────────────────────────

export const feedService = {
  getFeed: (page = 1, type?: string, category?: string) => {
    const q = new URLSearchParams({ page: String(page), limit: '20' });
    if (type && type !== 'ALL') q.set('type', type);
    if (category) q.set('category', category);
    return api.get<{ data: PagedResult<FeedItem> }>(`/marketplace/feed?${q}`);
  },

  engage: (postId: string, action: 'LIKE' | 'SAVE' | 'SHARE') =>
    api.post(`/marketplace/feed/${postId}/engage`, { action }),

  follow: (userId: string) => api.post(`/marketplace/follow/${userId}`),
  unfollow: (userId: string) => api.delete(`/marketplace/follow/${userId}`),
};

// ── Listings ───────────────────────────────────────────────────────────────

export const listingService = {
  list: (params?: { page?: number; search?: string; category?: string }) => {
    const q = new URLSearchParams({ page: String(params?.page ?? 1), limit: '20' });
    if (params?.search) q.set('search', params.search);
    if (params?.category) q.set('category', params.category);
    return api.get<{ data: PagedResult<Listing> }>(`/marketplace/listings?${q}`);
  },

  getById: (id: string) =>
    api.get<{ data: Listing }>(`/marketplace/listings/${id}`),
};

// ── Offers ─────────────────────────────────────────────────────────────────

export const offerService = {
  list: (page = 1) =>
    api.get<{ data: PagedResult<Offer> }>(`/marketplace/offers?page=${page}&limit=20&activeOnly=true`),

  getById: (id: string) =>
    api.get<{ data: Offer }>(`/marketplace/offers/${id}`),

  redeem: (offerId: string) =>
    api.post<{ data: { message: string } }>(`/marketplace/offers/${offerId}/redeem`),
};

// ── Reviews ────────────────────────────────────────────────────────────────

export const reviewService = {
  list: (listingId: string, page = 1) =>
    api.get<{ data: PagedResult<Review> }>(`/marketplace/reviews?listingId=${listingId}&page=${page}`),

  create: (payload: { listingId: string; rating: number; title?: string; body: string }) =>
    api.post('/marketplace/reviews', payload),
};

// ── Enquiries ──────────────────────────────────────────────────────────────

export const enquiryService = {
  list: (page = 1) =>
    api.get<{ data: PagedResult<Enquiry> }>(`/marketplace/enquiries?page=${page}`),

  getById: (id: string) =>
    api.get<{ data: Enquiry }>(`/marketplace/enquiries/${id}`),

  create: (payload: { listingId: string; message: string; quantity?: number; targetPrice?: number }) =>
    api.post('/marketplace/enquiries', payload),
};

// ── Requirements ───────────────────────────────────────────────────────────

export const requirementService = {
  list: (page = 1) =>
    api.get<{ data: PagedResult<Requirement> }>(`/marketplace/requirements?page=${page}`),

  create: (payload: { title: string; description?: string; quantity?: number; budget?: number; category?: string }) =>
    api.post('/marketplace/requirements', payload),
};

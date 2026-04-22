import apiClient from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";
import type {
  MarketplaceModule,
  InstalledModule,
  MarketplaceVendor,
  MarketplaceListing,
  MarketplacePost,
  MarketplaceEnquiry,
  MarketplaceOrder,
  MarketplaceReview,
  MarketplaceOffer,
  AnalyticsSummary,
  RequirementQuote,
  MarketplaceDashboardStats,
  RegisterVendorDto,
  CreateModuleDto,
  CreateListingDto,
  CreateOfferDto,
  CreateReviewDto,
  CreatePostDto,
  CreateOrderDto,
  UpdateOrderStatusDto,
  UpdateTrackingDto,
  CreateEnquiryDto,
  ReplyEnquiryDto,
  MarketplaceFilters,
  ListingListParams,
  OfferListParams,
  ReviewListParams,
  PostListParams,
} from "../types/marketplace.types";

const BASE = "/api/v1/marketplace";

// ── Modules ──────────────────────────────────────────
export function listModules(filters?: MarketplaceFilters) {
  return apiClient.get<ApiResponse<MarketplaceModule[]>>(`${BASE}/modules`, { params: filters }).then((r) => r.data);
}

export function getFeaturedModules() {
  return apiClient.get<ApiResponse<MarketplaceModule[]>>(`${BASE}/modules/featured`).then((r) => r.data);
}

export function getModuleByCode(code: string) {
  return apiClient.get<ApiResponse<MarketplaceModule>>(`${BASE}/modules/${code}`).then((r) => r.data);
}

export function installModule(id: string) {
  return apiClient.post<ApiResponse<InstalledModule>>(`${BASE}/modules/${id}/install`).then((r) => r.data);
}

export function activateModule(id: string) {
  return apiClient.post<ApiResponse<InstalledModule>>(`${BASE}/modules/${id}/activate`).then((r) => r.data);
}

export function uninstallModule(id: string) {
  return apiClient.delete<ApiResponse<void>>(`${BASE}/modules/${id}/install`).then((r) => r.data);
}

export function listInstalledModules() {
  return apiClient.get<ApiResponse<InstalledModule[]>>(`${BASE}/installed`).then((r) => r.data);
}

// ── Reviews (module marketplace) ─────────────────────────────────────────
export function submitReview(moduleId: string, dto: CreateReviewDto) {
  return apiClient.post<ApiResponse<MarketplaceReview>>(`${BASE}/modules/${moduleId}/reviews`, dto).then((r) => r.data);
}

export function listReviews(moduleId: string) {
  return apiClient.get<ApiResponse<MarketplaceReview[]>>(`${BASE}/modules/${moduleId}/reviews`).then((r) => r.data);
}

// ── Vendors ──────────────────────────────────────────
export function registerVendor(dto: RegisterVendorDto) {
  return apiClient.post<ApiResponse<MarketplaceVendor>>(`${BASE}/vendors`, dto).then((r) => r.data);
}

export function listVendors() {
  return apiClient.get<ApiResponse<MarketplaceVendor[]>>(`${BASE}/vendors`).then((r) => r.data);
}

export function getVendor(id: string) {
  return apiClient.get<ApiResponse<MarketplaceVendor>>(`${BASE}/vendors/${id}`).then((r) => r.data);
}

export function approveVendor(id: string) {
  return apiClient.put<ApiResponse<MarketplaceVendor>>(`${BASE}/vendors/${id}/approve`).then((r) => r.data);
}

export function suspendVendor(id: string) {
  return apiClient.put<ApiResponse<MarketplaceVendor>>(`${BASE}/vendors/${id}/suspend`).then((r) => r.data);
}

// ── Vendor Modules ───────────────────────────────────
export function createVendorModule(vendorId: string, dto: CreateModuleDto) {
  return apiClient.post<ApiResponse<MarketplaceModule>>(`${BASE}/vendors/${vendorId}/modules`, dto).then((r) => r.data);
}

export function updateVendorModule(id: string, dto: Partial<CreateModuleDto>) {
  return apiClient.put<ApiResponse<MarketplaceModule>>(`${BASE}/vendors/modules/${id}`, dto).then((r) => r.data);
}

export function submitModuleForReview(id: string) {
  return apiClient.put<ApiResponse<MarketplaceModule>>(`${BASE}/vendors/modules/${id}/submit`).then((r) => r.data);
}

export function publishModule(id: string) {
  return apiClient.put<ApiResponse<MarketplaceModule>>(`${BASE}/vendors/modules/${id}/publish`).then((r) => r.data);
}

// ── Listings (admin) ──────────────────────────────────────────────────────
export function listListings(filters?: MarketplaceFilters) {
  return apiClient.get<ApiResponse<MarketplaceListing[]>>(`${BASE}/listings`, { params: filters }).then((r) => r.data);
}

export function getListing(id: string) {
  return apiClient.get<ApiResponse<MarketplaceListing>>(`${BASE}/listings/${id}`).then((r) => r.data);
}

export function createListing(dto: CreateListingDto) {
  return apiClient.post<ApiResponse<MarketplaceListing>>(`${BASE}/listings`, dto).then((r) => r.data);
}

export function updateListing(id: string, dto: Partial<CreateListingDto>) {
  return apiClient.put<ApiResponse<MarketplaceListing>>(`${BASE}/listings/${id}`, dto).then((r) => r.data);
}

export function deleteListing(id: string) {
  return apiClient.delete<ApiResponse<void>>(`${BASE}/listings/${id}`).then((r) => r.data);
}

export function publishListing(id: string) {
  return apiClient.post<ApiResponse<MarketplaceListing>>(`${BASE}/listings/${id}/publish`).then((r) => r.data);
}

export function getMyListings() {
  return apiClient.get<ApiResponse<MarketplaceListing[]>>(`${BASE}/listings/vendor/mine`).then((r) => r.data);
}

export function getAdminListings(params?: ListingListParams) {
  return apiClient
    .get<ApiResponse<{ data: MarketplaceListing[]; meta: unknown }>>(`${BASE}/admin/listings`, { params })
    .then((r) => r.data);
}

// ── Offers ────────────────────────────────────────────────────────────────
export function getOffers(params?: OfferListParams) {
  return apiClient
    .get<ApiResponse<{ data: MarketplaceOffer[]; meta: unknown }>>(`${BASE}/offers`, { params })
    .then((r) => r.data);
}

export function getOffer(id: string) {
  return apiClient.get<ApiResponse<MarketplaceOffer>>(`${BASE}/offers/${id}`).then((r) => r.data);
}

export function createOffer(dto: CreateOfferDto) {
  return apiClient.post<ApiResponse<MarketplaceOffer>>(`${BASE}/offers`, dto).then((r) => r.data);
}

export function updateOffer(id: string, dto: Partial<CreateOfferDto>) {
  return apiClient.put<ApiResponse<MarketplaceOffer>>(`${BASE}/offers/${id}`, dto).then((r) => r.data);
}

export function deleteOffer(id: string) {
  return apiClient.delete<ApiResponse<void>>(`${BASE}/offers/${id}`).then((r) => r.data);
}

export function activateOffer(id: string) {
  return apiClient.post<ApiResponse<MarketplaceOffer>>(`${BASE}/offers/${id}/activate`).then((r) => r.data);
}

export function pauseOffer(id: string) {
  return apiClient.post<ApiResponse<MarketplaceOffer>>(`${BASE}/offers/${id}/pause`).then((r) => r.data);
}

export function closeOffer(id: string) {
  return apiClient.post<ApiResponse<MarketplaceOffer>>(`${BASE}/offers/${id}/close`).then((r) => r.data);
}

// ── Reviews (admin moderation) ────────────────────────────────────────────
export function getReviews(params?: ReviewListParams) {
  return apiClient
    .get<ApiResponse<{ data: MarketplaceReview[]; meta: unknown }>>(`${BASE}/reviews`, { params })
    .then((r) => r.data);
}

export function approveReview(id: string) {
  return apiClient.post<ApiResponse<MarketplaceReview>>(`${BASE}/reviews/${id}/approve`).then((r) => r.data);
}

export function rejectReview(id: string, note: string) {
  return apiClient.post<ApiResponse<MarketplaceReview>>(`${BASE}/reviews/${id}/reject`, { note }).then((r) => r.data);
}

// ── Posts / Feed ──────────────────────────────────────────────────────────
export function getFeed(params?: { page?: number; limit?: number }) {
  return apiClient.get<ApiResponse<MarketplacePost[]>>(`${BASE}/posts/feed`, { params }).then((r) => r.data);
}

export function getPosts(params?: PostListParams) {
  return apiClient
    .get<ApiResponse<{ data: MarketplacePost[]; meta: unknown }>>(`${BASE}/posts`, { params })
    .then((r) => r.data);
}

export function getPost(id: string) {
  return apiClient.get<ApiResponse<MarketplacePost>>(`${BASE}/posts/${id}`).then((r) => r.data);
}

export function createPost(dto: CreatePostDto) {
  return apiClient.post<ApiResponse<MarketplacePost>>(`${BASE}/posts`, dto).then((r) => r.data);
}

export function deletePost(id: string) {
  return apiClient.delete<ApiResponse<void>>(`${BASE}/posts/${id}`).then((r) => r.data);
}

export function toggleLike(id: string) {
  return apiClient.post<ApiResponse<void>>(`${BASE}/posts/${id}/like`).then((r) => r.data);
}

export function toggleSave(id: string) {
  return apiClient.post<ApiResponse<void>>(`${BASE}/posts/${id}/save`).then((r) => r.data);
}

export function addComment(id: string, dto: { content: string }) {
  return apiClient.post<ApiResponse<void>>(`${BASE}/posts/${id}/comment`, dto).then((r) => r.data);
}

export function sharePost(id: string) {
  return apiClient.post<ApiResponse<void>>(`${BASE}/posts/${id}/share`).then((r) => r.data);
}

// ── Analytics ─────────────────────────────────────────────────────────────
export function getEntityAnalytics(entityType: string, entityId: string) {
  return apiClient
    .get<ApiResponse<AnalyticsSummary>>(`${BASE}/analytics/${entityType}/${entityId}`)
    .then((r) => r.data);
}

export function getDashboard() {
  return apiClient
    .get<ApiResponse<MarketplaceDashboardStats>>(`${BASE}/admin/dashboard`)
    .then((r) => r.data);
}

export function getTopPerforming() {
  return apiClient
    .get<ApiResponse<{ posts: MarketplacePost[]; listings: MarketplaceListing[]; offers: MarketplaceOffer[] }>>(
      `${BASE}/analytics/top-performing`,
    )
    .then((r) => r.data);
}

// ── Enquiries ─────────────────────────────────────────────────────────────
export function createEnquiry(dto: CreateEnquiryDto) {
  return apiClient.post<ApiResponse<MarketplaceEnquiry>>(`${BASE}/enquiries`, dto).then((r) => r.data);
}

export function getVendorEnquiries() {
  return apiClient.get<ApiResponse<MarketplaceEnquiry[]>>(`${BASE}/enquiries/vendor`).then((r) => r.data);
}

export function getBuyerEnquiries() {
  return apiClient.get<ApiResponse<MarketplaceEnquiry[]>>(`${BASE}/enquiries/buyer`).then((r) => r.data);
}

export function getEnquiry(id: string) {
  return apiClient.get<ApiResponse<MarketplaceEnquiry>>(`${BASE}/enquiries/${id}`).then((r) => r.data);
}

export function getEnquiries(params?: Record<string, unknown>) {
  return apiClient
    .get<ApiResponse<{ data: MarketplaceEnquiry[]; meta: unknown }>>(`${BASE}/enquiries`, { params })
    .then((r) => r.data);
}

export function replyEnquiry(id: string, dto: ReplyEnquiryDto) {
  return apiClient.post<ApiResponse<void>>(`${BASE}/enquiries/${id}/reply`, dto).then((r) => r.data);
}

export function markEnquiryRead(id: string) {
  return apiClient.post<ApiResponse<void>>(`${BASE}/enquiries/${id}/read`).then((r) => r.data);
}

export function convertEnquiryToLead(id: string) {
  return apiClient.post<ApiResponse<{ leadId: string }>>(`${BASE}/enquiries/${id}/convert-lead`).then((r) => r.data);
}

// ── Orders ────────────────────────────────────────────────────────────────
export function createOrder(dto: CreateOrderDto) {
  return apiClient.post<ApiResponse<MarketplaceOrder>>(`${BASE}/orders`, dto).then((r) => r.data);
}

export function getVendorOrders() {
  return apiClient.get<ApiResponse<MarketplaceOrder[]>>(`${BASE}/orders/vendor`).then((r) => r.data);
}

export function getBuyerOrders() {
  return apiClient.get<ApiResponse<MarketplaceOrder[]>>(`${BASE}/orders/buyer`).then((r) => r.data);
}

export function getOrder(id: string) {
  return apiClient.get<ApiResponse<MarketplaceOrder>>(`${BASE}/orders/${id}`).then((r) => r.data);
}

export function updateOrderStatus(id: string, dto: UpdateOrderStatusDto) {
  return apiClient.put<ApiResponse<MarketplaceOrder>>(`${BASE}/orders/${id}/status`, dto).then((r) => r.data);
}

export function updateTracking(id: string, dto: UpdateTrackingDto) {
  return apiClient.put<ApiResponse<MarketplaceOrder>>(`${BASE}/orders/${id}/tracking`, dto).then((r) => r.data);
}

// ── Requirements ──────────────────────────────────────────────────────────
export function getRequirements(params?: Record<string, unknown>) {
  return apiClient
    .get<ApiResponse<{ data: MarketplaceListing[]; meta: unknown }>>(`${BASE}/requirements`, { params })
    .then((r) => r.data);
}

export function postRequirement(dto: Partial<CreateListingDto>) {
  return apiClient.post<ApiResponse<MarketplaceListing>>(`${BASE}/requirements`, dto).then((r) => r.data);
}

export function getRequirementQuotes(requirementId: string) {
  return apiClient
    .get<ApiResponse<RequirementQuote[]>>(`${BASE}/requirements/${requirementId}/quotes`)
    .then((r) => r.data);
}

// ── Storage ───────────────────────────────────────────────────────────────
export function getPresignedUrl(contentType: string, filename: string) {
  return apiClient
    .post<ApiResponse<{ url: string; key: string }>>(`${BASE}/storage/presigned`, { contentType, filename })
    .then((r) => r.data);
}

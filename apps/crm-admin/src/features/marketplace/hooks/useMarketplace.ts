import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as svc from "../services/marketplace.service";
import type {
  RegisterVendorDto,
  CreateModuleDto,
  CreateListingDto,
  CreateOfferDto,
  CreatePostDto,
  CreateOrderDto,
  UpdateOrderStatusDto,
  UpdateTrackingDto,
  CreateReviewDto,
  CreateEnquiryDto,
  ReplyEnquiryDto,
  MarketplaceFilters,
  ListingListParams,
  OfferListParams,
  ReviewListParams,
  PostListParams,
} from "../types/marketplace.types";

const KEYS = {
  modules: "marketplace-modules",
  featured: "marketplace-featured",
  installed: "marketplace-installed",
  vendors: "marketplace-vendors",
  listings: "marketplace-listings",
  myListings: "marketplace-my-listings",
  adminListings: "marketplace-admin-listings",
  offers: "marketplace-offers",
  reviews: "marketplace-admin-reviews",
  posts: "marketplace-posts",
  feed: "marketplace-feed",
  enquiries: "marketplace-enquiries",
  enquiriesVendor: "marketplace-enquiries-vendor",
  enquiriesBuyer: "marketplace-enquiries-buyer",
  ordersVendor: "marketplace-orders-vendor",
  ordersBuyer: "marketplace-orders-buyer",
  requirements: "marketplace-requirements",
  dashboard: "marketplace-dashboard",
  analytics: "marketplace-analytics",
};

// ── Modules ──────────────────────────────────────────
export function useMarketplaceModules(filters?: MarketplaceFilters) {
  return useQuery({ queryKey: [KEYS.modules, filters], queryFn: () => svc.listModules(filters) });
}

export function useFeaturedModules() {
  return useQuery({ queryKey: [KEYS.featured], queryFn: svc.getFeaturedModules });
}

export function useModuleByCode(code: string) {
  return useQuery({ queryKey: [KEYS.modules, code], queryFn: () => svc.getModuleByCode(code), enabled: !!code });
}

export function useInstalledModules() {
  return useQuery({ queryKey: [KEYS.installed], queryFn: svc.listInstalledModules });
}

export function useInstallModule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => svc.installModule(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEYS.installed] });
      qc.invalidateQueries({ queryKey: [KEYS.modules] });
    },
  });
}

export function useActivateModule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => svc.activateModule(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.installed] }),
  });
}

export function useUninstallModule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => svc.uninstallModule(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEYS.installed] });
      qc.invalidateQueries({ queryKey: [KEYS.modules] });
    },
  });
}

// ── Module Reviews ──────────────────────────────────────────────────────
export function useModuleReviews(moduleId: string) {
  return useQuery({
    queryKey: [KEYS.reviews, moduleId],
    queryFn: () => svc.listReviews(moduleId),
    enabled: !!moduleId,
  });
}

export function useSubmitReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ moduleId, dto }: { moduleId: string; dto: CreateReviewDto }) => svc.submitReview(moduleId, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.reviews] }),
  });
}

// ── Vendors ──────────────────────────────────────────
export function useVendors() {
  return useQuery({ queryKey: [KEYS.vendors], queryFn: svc.listVendors });
}

export function useVendor(id: string) {
  return useQuery({ queryKey: [KEYS.vendors, id], queryFn: () => svc.getVendor(id), enabled: !!id });
}

export function useRegisterVendor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: RegisterVendorDto) => svc.registerVendor(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.vendors] }),
  });
}

export function useApproveVendor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => svc.approveVendor(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.vendors] }),
  });
}

export function useSuspendVendor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => svc.suspendVendor(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.vendors] }),
  });
}

// ── Vendor Modules ───────────────────────────────────
export function useCreateVendorModule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ vendorId, dto }: { vendorId: string; dto: CreateModuleDto }) =>
      svc.createVendorModule(vendorId, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.modules] }),
  });
}

export function useUpdateVendorModule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<CreateModuleDto> }) => svc.updateVendorModule(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.modules] }),
  });
}

export function useSubmitModuleForReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => svc.submitModuleForReview(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.modules] }),
  });
}

export function usePublishModule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => svc.publishModule(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.modules] }),
  });
}

// ── Listings (admin) ─────────────────────────────────────────────────────
export function useListings(params?: ListingListParams) {
  return useQuery({
    queryKey: [KEYS.adminListings, params],
    queryFn: () => svc.getAdminListings(params),
  });
}

export function useListing(id: string) {
  return useQuery({
    queryKey: [KEYS.listings, id],
    queryFn: () => svc.getListing(id),
    enabled: !!id,
  });
}

export function useMyListings() {
  return useQuery({ queryKey: [KEYS.myListings], queryFn: svc.getMyListings });
}

export function useCreateListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateListingDto) => svc.createListing(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.adminListings] }),
  });
}

export function useUpdateListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<CreateListingDto> }) => svc.updateListing(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.adminListings] }),
  });
}

export function useDeleteListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => svc.deleteListing(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.adminListings] }),
  });
}

export function usePublishListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => svc.publishListing(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.adminListings] }),
  });
}

// ── Offers ───────────────────────────────────────────────────────────────
export function useOffers(params?: OfferListParams) {
  return useQuery({
    queryKey: [KEYS.offers, params],
    queryFn: () => svc.getOffers(params),
  });
}

export function useOffer(id: string) {
  return useQuery({
    queryKey: [KEYS.offers, id],
    queryFn: () => svc.getOffer(id),
    enabled: !!id,
  });
}

export function useCreateOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateOfferDto) => svc.createOffer(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.offers] }),
  });
}

export function useUpdateOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<CreateOfferDto> }) => svc.updateOffer(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.offers] }),
  });
}

export function useDeleteOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => svc.deleteOffer(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.offers] }),
  });
}

export function useActivateOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => svc.activateOffer(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.offers] }),
  });
}

export function usePauseOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => svc.pauseOffer(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.offers] }),
  });
}

export function useCloseOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => svc.closeOffer(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.offers] }),
  });
}

// ── Reviews (admin) ───────────────────────────────────────────────────────
export function useReviews(params?: ReviewListParams) {
  return useQuery({
    queryKey: [KEYS.reviews, params],
    queryFn: () => svc.getReviews(params),
  });
}

export function useApproveReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => svc.approveReview(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.reviews] }),
  });
}

export function useRejectReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) => svc.rejectReview(id, note),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.reviews] }),
  });
}

// ── Posts / Feed ──────────────────────────────────────────────────────────
export function useFeed(params?: { page?: number; limit?: number }) {
  return useQuery({ queryKey: [KEYS.feed, params], queryFn: () => svc.getFeed(params) });
}

export function usePosts(params?: PostListParams) {
  return useQuery({
    queryKey: [KEYS.posts, params],
    queryFn: () => svc.getPosts(params),
  });
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreatePostDto) => svc.createPost(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEYS.feed] });
      qc.invalidateQueries({ queryKey: [KEYS.posts] });
    },
  });
}

export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => svc.deletePost(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEYS.posts] });
      qc.invalidateQueries({ queryKey: [KEYS.feed] });
    },
  });
}

export function useToggleLike() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => svc.toggleLike(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.feed] }),
  });
}

export function useToggleSave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => svc.toggleSave(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.feed] }),
  });
}

export function useAddComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) => svc.addComment(id, { content }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.feed] }),
  });
}

// ── Analytics ─────────────────────────────────────────────────────────────
export function useMarketplaceDashboard() {
  return useQuery({
    queryKey: [KEYS.dashboard],
    queryFn: () => svc.getDashboard(),
  });
}

export function useEntityAnalytics(entityType: string, entityId: string) {
  return useQuery({
    queryKey: [KEYS.analytics, entityType, entityId],
    queryFn: () => svc.getEntityAnalytics(entityType, entityId),
    enabled: !!entityType && !!entityId,
  });
}

// ── Enquiries ─────────────────────────────────────────────────────────────
export function useEnquiries(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [KEYS.enquiries, params],
    queryFn: () => svc.getEnquiries(params),
  });
}

export function useVendorEnquiries() {
  return useQuery({ queryKey: [KEYS.enquiriesVendor], queryFn: svc.getVendorEnquiries });
}

export function useBuyerEnquiries() {
  return useQuery({ queryKey: [KEYS.enquiriesBuyer], queryFn: svc.getBuyerEnquiries });
}

export function useCreateEnquiry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateEnquiryDto) => svc.createEnquiry(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.enquiriesBuyer] }),
  });
}

export function useReplyEnquiry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: ReplyEnquiryDto }) => svc.replyEnquiry(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEYS.enquiriesVendor] });
      qc.invalidateQueries({ queryKey: [KEYS.enquiriesBuyer] });
      qc.invalidateQueries({ queryKey: [KEYS.enquiries] });
    },
  });
}

export function useConvertEnquiryToLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => svc.convertEnquiryToLead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.enquiries] }),
  });
}

// ── Orders ────────────────────────────────────────────────────────────────
export function useVendorOrders() {
  return useQuery({ queryKey: [KEYS.ordersVendor], queryFn: svc.getVendorOrders });
}

export function useBuyerOrders() {
  return useQuery({ queryKey: [KEYS.ordersBuyer], queryFn: svc.getBuyerOrders });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateOrderDto) => svc.createOrder(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.ordersBuyer] }),
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateOrderStatusDto }) => svc.updateOrderStatus(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEYS.ordersVendor] });
      qc.invalidateQueries({ queryKey: [KEYS.ordersBuyer] });
    },
  });
}

export function useUpdateTracking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateTrackingDto }) => svc.updateTracking(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.ordersVendor] }),
  });
}

// ── Requirements ──────────────────────────────────────────────────────────
export function useRequirements(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [KEYS.requirements, params],
    queryFn: () => svc.getRequirements(params),
  });
}

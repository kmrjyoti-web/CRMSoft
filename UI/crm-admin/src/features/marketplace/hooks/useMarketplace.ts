import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as svc from "../services/marketplace.service";
import type {
  RegisterVendorDto,
  CreateModuleDto,
  CreateListingDto,
  CreateOrderDto,
  UpdateOrderStatusDto,
  UpdateTrackingDto,
  CreateReviewDto,
  CreateEnquiryDto,
  ReplyEnquiryDto,
  CreatePostDto,
  MarketplaceFilters,
} from "../types/marketplace.types";

const KEYS = {
  modules: "marketplace-modules",
  featured: "marketplace-featured",
  installed: "marketplace-installed",
  vendors: "marketplace-vendors",
  listings: "marketplace-listings",
  myListings: "marketplace-my-listings",
  feed: "marketplace-feed",
  enquiriesVendor: "marketplace-enquiries-vendor",
  enquiriesBuyer: "marketplace-enquiries-buyer",
  ordersVendor: "marketplace-orders-vendor",
  ordersBuyer: "marketplace-orders-buyer",
  reviews: "marketplace-reviews",
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
  return useMutation({ mutationFn: (id: string) => svc.installModule(id), onSuccess: () => { qc.invalidateQueries({ queryKey: [KEYS.installed] }); qc.invalidateQueries({ queryKey: [KEYS.modules] }); } });
}

export function useActivateModule() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => svc.activateModule(id), onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.installed] }) });
}

export function useUninstallModule() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => svc.uninstallModule(id), onSuccess: () => { qc.invalidateQueries({ queryKey: [KEYS.installed] }); qc.invalidateQueries({ queryKey: [KEYS.modules] }); } });
}

// ── Reviews ──────────────────────────────────────────
export function useModuleReviews(moduleId: string) {
  return useQuery({ queryKey: [KEYS.reviews, moduleId], queryFn: () => svc.listReviews(moduleId), enabled: !!moduleId });
}

export function useSubmitReview() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ moduleId, dto }: { moduleId: string; dto: CreateReviewDto }) => svc.submitReview(moduleId, dto), onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.reviews] }) });
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
  return useMutation({ mutationFn: (dto: RegisterVendorDto) => svc.registerVendor(dto), onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.vendors] }) });
}

export function useApproveVendor() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => svc.approveVendor(id), onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.vendors] }) });
}

export function useSuspendVendor() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => svc.suspendVendor(id), onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.vendors] }) });
}

// ── Vendor Modules ───────────────────────────────────
export function useCreateVendorModule() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ vendorId, dto }: { vendorId: string; dto: CreateModuleDto }) => svc.createVendorModule(vendorId, dto), onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.modules] }) });
}

export function useUpdateVendorModule() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, dto }: { id: string; dto: Partial<CreateModuleDto> }) => svc.updateVendorModule(id, dto), onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.modules] }) });
}

export function useSubmitModuleForReview() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => svc.submitModuleForReview(id), onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.modules] }) });
}

export function usePublishModule() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => svc.publishModule(id), onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.modules] }) });
}

// ── Listings ─────────────────────────────────────────
export function useListings(filters?: MarketplaceFilters) {
  return useQuery({ queryKey: [KEYS.listings, filters], queryFn: () => svc.listListings(filters) });
}

export function useListing(id: string) {
  return useQuery({ queryKey: [KEYS.listings, id], queryFn: () => svc.getListing(id), enabled: !!id });
}

export function useMyListings() {
  return useQuery({ queryKey: [KEYS.myListings], queryFn: svc.getMyListings });
}

export function useCreateListing() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (dto: CreateListingDto) => svc.createListing(dto), onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.listings] }) });
}

export function useUpdateListing() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, dto }: { id: string; dto: Partial<CreateListingDto> }) => svc.updateListing(id, dto), onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.listings] }) });
}

// ── Posts ─────────────────────────────────────────────
export function useFeed(params?: { page?: number; limit?: number }) {
  return useQuery({ queryKey: [KEYS.feed, params], queryFn: () => svc.getFeed(params) });
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (dto: CreatePostDto) => svc.createPost(dto), onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.feed] }) });
}

export function useToggleLike() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => svc.toggleLike(id), onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.feed] }) });
}

export function useToggleSave() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => svc.toggleSave(id), onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.feed] }) });
}

export function useAddComment() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, content }: { id: string; content: string }) => svc.addComment(id, { content }), onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.feed] }) });
}

// ── Enquiries ────────────────────────────────────────
export function useVendorEnquiries() {
  return useQuery({ queryKey: [KEYS.enquiriesVendor], queryFn: svc.getVendorEnquiries });
}

export function useBuyerEnquiries() {
  return useQuery({ queryKey: [KEYS.enquiriesBuyer], queryFn: svc.getBuyerEnquiries });
}

export function useCreateEnquiry() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (dto: CreateEnquiryDto) => svc.createEnquiry(dto), onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.enquiriesBuyer] }) });
}

export function useReplyEnquiry() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, dto }: { id: string; dto: ReplyEnquiryDto }) => svc.replyEnquiry(id, dto), onSuccess: () => { qc.invalidateQueries({ queryKey: [KEYS.enquiriesVendor] }); qc.invalidateQueries({ queryKey: [KEYS.enquiriesBuyer] }); } });
}

// ── Orders ───────────────────────────────────────────
export function useVendorOrders() {
  return useQuery({ queryKey: [KEYS.ordersVendor], queryFn: svc.getVendorOrders });
}

export function useBuyerOrders() {
  return useQuery({ queryKey: [KEYS.ordersBuyer], queryFn: svc.getBuyerOrders });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (dto: CreateOrderDto) => svc.createOrder(dto), onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.ordersBuyer] }) });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, dto }: { id: string; dto: UpdateOrderStatusDto }) => svc.updateOrderStatus(id, dto), onSuccess: () => { qc.invalidateQueries({ queryKey: [KEYS.ordersVendor] }); qc.invalidateQueries({ queryKey: [KEYS.ordersBuyer] }); } });
}

export function useUpdateTracking() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, dto }: { id: string; dto: UpdateTrackingDto }) => svc.updateTracking(id, dto), onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.ordersVendor] }) });
}

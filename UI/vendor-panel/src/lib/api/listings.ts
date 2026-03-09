import apiClient from './client';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { Listing, CreateListingDto, ListingFilters } from '@/types/listing';

export const listingsApi = {
  list: (filters?: ListingFilters) =>
    apiClient.get<ApiResponse<PaginatedResponse<Listing>>>('/marketplace/listings/vendor/mine', { params: filters }).then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<ApiResponse<Listing>>(`/marketplace/listings/${id}`).then((r) => r.data),

  create: (data: CreateListingDto) =>
    apiClient.post<ApiResponse<Listing>>('/marketplace/listings', data).then((r) => r.data),

  update: (id: string, data: Partial<CreateListingDto>) =>
    apiClient.put<ApiResponse<Listing>>(`/marketplace/listings/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/marketplace/listings/${id}`).then((r) => r.data),
};

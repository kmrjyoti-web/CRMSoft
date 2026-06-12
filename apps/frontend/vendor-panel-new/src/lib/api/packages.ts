import apiClient from './client';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { SubscriptionPackage, CreatePackageDto, PackageFilters, AddModuleToPackageDto, EntityLimit } from '@/types/package';

export const packagesApi = {
  list: (filters?: PackageFilters) =>
    apiClient.get<ApiResponse<PaginatedResponse<SubscriptionPackage>>>('/vendor/package-builder', { params: filters }).then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<ApiResponse<SubscriptionPackage>>(`/vendor/package-builder/${id}`).then((r) => r.data),

  create: (data: CreatePackageDto) =>
    apiClient.post<ApiResponse<SubscriptionPackage>>('/vendor/package-builder', data).then((r) => r.data),

  update: (id: string, data: Partial<CreatePackageDto>) =>
    apiClient.patch<ApiResponse<SubscriptionPackage>>(`/vendor/package-builder/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/vendor/package-builder/${id}`).then((r) => r.data),

  // Module management within package
  addModule: (packageId: string, dto: AddModuleToPackageDto) =>
    apiClient.post(`/vendor/package-builder/${packageId}/modules`, dto).then((r) => r.data),

  updateModule: (packageId: string, moduleId: string, updates: Partial<AddModuleToPackageDto>) =>
    apiClient.patch(`/vendor/package-builder/${packageId}/modules/${moduleId}`, updates).then((r) => r.data),

  removeModule: (packageId: string, moduleId: string) =>
    apiClient.delete(`/vendor/package-builder/${packageId}/modules/${moduleId}`).then((r) => r.data),

  // Limits
  updateLimits: (packageId: string, entityLimits: Record<string, EntityLimit>) =>
    apiClient.patch(`/vendor/package-builder/${packageId}/limits`, entityLimits).then((r) => r.data),

  // Comparison
  compare: (ids: string[]) =>
    apiClient.get(`/vendor/package-builder/compare`, { params: { ids: ids.join(',') } }).then((r) => r.data),

  // Subscribers
  getSubscribers: (packageId: string, params?: { page?: number; limit?: number }) =>
    apiClient.get(`/vendor/package-builder/${packageId}/subscribers`, { params }).then((r) => r.data),
};

import apiClient from './client';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { SoftwareModule, CreateModuleDto, ModuleFilters, ModuleFeature, DependencyNode } from '@/types/module';

export const modulesApi = {
  list: (filters?: ModuleFilters) =>
    apiClient.get<ApiResponse<PaginatedResponse<SoftwareModule>>>('/vendor/module-registry', { params: filters }).then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<ApiResponse<SoftwareModule>>(`/vendor/module-registry/${id}`).then((r) => r.data),

  create: (data: CreateModuleDto) =>
    apiClient.post<ApiResponse<SoftwareModule>>('/vendor/module-registry', data).then((r) => r.data),

  update: (id: string, data: Partial<CreateModuleDto>) =>
    apiClient.patch<ApiResponse<SoftwareModule>>(`/vendor/module-registry/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/vendor/module-registry/${id}`).then((r) => r.data),

  // Feature management
  addFeature: (moduleId: string, feature: Omit<ModuleFeature, 'isDefault'> & { isDefault?: boolean }) =>
    apiClient.post<ApiResponse<SoftwareModule>>(`/vendor/module-registry/${moduleId}/features`, feature).then((r) => r.data),

  updateFeature: (moduleId: string, featureCode: string, updates: Partial<ModuleFeature>) =>
    apiClient.patch<ApiResponse<SoftwareModule>>(`/vendor/module-registry/${moduleId}/features/${featureCode}`, updates).then((r) => r.data),

  removeFeature: (moduleId: string, featureCode: string) =>
    apiClient.delete<ApiResponse<SoftwareModule>>(`/vendor/module-registry/${moduleId}/features/${featureCode}`).then((r) => r.data),

  // Menu keys
  setMenuKeys: (moduleId: string, menuKeys: string[]) =>
    apiClient.post<ApiResponse<SoftwareModule>>(`/vendor/module-registry/${moduleId}/menu-keys`, { menuKeys }).then((r) => r.data),

  // Dependencies
  getDependencyTree: (moduleId: string) =>
    apiClient.get<ApiResponse<DependencyNode[]>>(`/vendor/module-registry/${moduleId}/dependencies`).then((r) => r.data),

  setDependencies: (moduleId: string, dependsOn: string[]) =>
    apiClient.post<ApiResponse<SoftwareModule>>(`/vendor/module-registry/${moduleId}/dependencies`, { dependsOn }).then((r) => r.data),

  // Subscribers
  getSubscribers: (moduleId: string, params?: { page?: number; limit?: number }) =>
    apiClient.get(`/vendor/module-registry/${moduleId}/subscribers`, { params }).then((r) => r.data),
};

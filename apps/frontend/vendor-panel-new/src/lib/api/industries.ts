import apiClient from './client';
import type { ApiResponse } from '@/types/api';

export interface IndustryType {
  id: string;
  typeCode: string;
  typeName: string;
  industryCategory: string;
  description?: string;
  icon?: string;
  colorTheme?: string;
  terminologyMap: Record<string, string>;
  defaultModules: string[];
  recommendedModules: string[];
  excludedModules: string[];
  extraFields: Record<string, unknown[]>;
  defaultLeadStages?: string[];
  defaultActivityTypes?: string[];
  registrationFields?: Record<string, unknown>[];
  dashboardWidgets: string[];
  workflowTemplates: string[];
  isActive: boolean;
  isDefault: boolean;
  sortOrder: number;
  _count?: { tenants: number };
}

export const industryApi = {
  list: () =>
    apiClient
      .get<ApiResponse<IndustryType[]>>('/business-types?activeOnly=false')
      .then((r) => r.data),

  getByCode: (code: string) =>
    apiClient
      .get<ApiResponse<IndustryType>>(`/business-types/${code}`)
      .then((r) => r.data),

  seed: () =>
    apiClient
      .post<ApiResponse<{ seeded: number }>>('/business-types/seed')
      .then((r) => r.data),

  update: (code: string, data: Partial<IndustryType>) =>
    apiClient
      .put<ApiResponse<IndustryType>>(`/business-types/${code}`, data)
      .then((r) => r.data),
};

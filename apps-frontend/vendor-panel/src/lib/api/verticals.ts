import { apiClient } from './client';

export interface VerticalModule {
  id: string;
  verticalId: string;
  moduleCode: string;
  isRequired: boolean;
  createdAt: string;
}

export interface Vertical {
  id: string;
  code: string;
  name: string;
  description: string | null;
  tablePrefix: string;
  isActive: boolean;
  isBuilt: boolean;
  sortOrder: number;
  metadata: unknown;
  createdAt: string;
  updatedAt: string;
  modules: VerticalModule[];
}

export const verticalsApi = {
  listAll: () => apiClient.get<Vertical[]>('/platform/verticals'),
  findActive: () => apiClient.get<Vertical[]>('/platform/verticals/active'),
  findBuilt: () => apiClient.get<Vertical[]>('/platform/verticals/built'),
  findByCode: (code: string) => apiClient.get<Vertical>(`/platform/verticals/${code}`),
};

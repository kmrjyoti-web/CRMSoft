import apiClient from '@/services/api-client';

import type {
  PackageItem,
  PackageCreateData,
  PackageUpdateData,
  UnitTypeOption,
  ProductListItem,
  ProductListParams,
  ProductCreateData,
  ProductUpdateData,
  ListParams,
} from '../types/products.types';

import type { ApiResponse } from '@/types/api-response';

// ---------------------------------------------------------------------------
// Package Service
// ---------------------------------------------------------------------------

const PACKAGES_URL = '/api/v1/packages';

export const packageService = {
  getAll(params?: ListParams) {
    return apiClient.get<ApiResponse<PackageItem[]>>(PACKAGES_URL, { params });
  },
  getById(id: string) {
    return apiClient.get<ApiResponse<PackageItem>>(`${PACKAGES_URL}/${id}`);
  },
  create(data: PackageCreateData) {
    return apiClient.post<ApiResponse<PackageItem>>(PACKAGES_URL, data);
  },
  update(id: string, data: PackageUpdateData) {
    return apiClient.put<ApiResponse<PackageItem>>(`${PACKAGES_URL}/${id}`, data);
  },
  delete(id: string) {
    return apiClient.delete<ApiResponse<PackageItem>>(`${PACKAGES_URL}/${id}`);
  },
};

// ---------------------------------------------------------------------------
// Unit Service (product-units backend)
// ---------------------------------------------------------------------------

const UNITS_URL = '/api/v1/units';

export const unitService = {
  getTypes() {
    return apiClient.get<ApiResponse<UnitTypeOption[]>>(`${UNITS_URL}/types`);
  },
};

// ---------------------------------------------------------------------------
// Product Service
// ---------------------------------------------------------------------------

const PRODUCTS_URL = '/api/v1/products';

export const productService = {
  getAll(params?: ProductListParams) {
    return apiClient.get<ApiResponse<ProductListItem[]>>(PRODUCTS_URL, { params });
  },
  getById(id: string) {
    return apiClient.get<ApiResponse<ProductListItem>>(`${PRODUCTS_URL}/${id}`);
  },
  create(data: ProductCreateData) {
    return apiClient.post<ApiResponse<ProductListItem>>(PRODUCTS_URL, data);
  },
  update(id: string, data: ProductUpdateData) {
    return apiClient.put<ApiResponse<ProductListItem>>(`${PRODUCTS_URL}/${id}`, data);
  },
  deactivate(id: string) {
    return apiClient.post<ApiResponse<ProductListItem>>(`${PRODUCTS_URL}/${id}/deactivate`);
  },
};

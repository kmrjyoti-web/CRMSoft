import apiClient from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";
import type { ProductImage, RelatedProduct, HSNCode, AddRelatedProductsDto } from "../types/product-media.types";

const PRODUCTS = "/api/v1/products";

export function getImages(productId: string) {
  return apiClient.get<ApiResponse<ProductImage[]>>(`${PRODUCTS}/${productId}/images`).then((r) => r.data);
}

export function manageImages(productId: string, images: { url: string; alt?: string; isPrimary?: boolean; displayOrder?: number }[]) {
  return apiClient.post<ApiResponse<ProductImage[]>>(`${PRODUCTS}/${productId}/images`, { images }).then((r) => r.data);
}

export function getRelated(productId: string) {
  return apiClient.get<ApiResponse<RelatedProduct[]>>(`${PRODUCTS}/${productId}/relations`).then((r) => r.data);
}

export function addRelated(productId: string, dto: AddRelatedProductsDto) {
  return apiClient.post<ApiResponse<RelatedProduct>>(`${PRODUCTS}/${productId}/relations`, dto).then((r) => r.data);
}

export function removeRelated(productId: string, relationId: string) {
  return apiClient.delete<ApiResponse<void>>(`${PRODUCTS}/${productId}/relations/${relationId}`).then((r) => r.data);
}

export function searchHSN(query: string) {
  return apiClient.get<ApiResponse<HSNCode[]>>(`${PRODUCTS}/hsn/search`, { params: { q: query } }).then((r) => r.data);
}

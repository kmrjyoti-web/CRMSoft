export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  thumbnailUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  width: number;
  height: number;
  displayOrder: number;
  isPrimary: boolean;
  alt?: string;
  createdAt: string;
}

export interface RelatedProduct {
  id: string;
  productId: string;
  relatedProductId: string;
  relatedProductName: string;
  relatedProductSku: string;
  relatedProductImage?: string;
  relationType: 'SIMILAR' | 'ACCESSORY' | 'UPSELL' | 'CROSS_SELL' | 'BUNDLE';
  displayOrder: number;
}

export interface HSNCode {
  code: string;
  description: string;
  gstRate: number;
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
  cess?: number;
  category: string;
}

export interface UploadImageDto {
  file: File;
  alt?: string;
  isPrimary?: boolean;
}

export interface ReorderImagesDto {
  imageIds: string[];
}

export interface AddRelatedProductsDto {
  relatedProductIds: string[];
  relationType: RelatedProduct['relationType'];
}

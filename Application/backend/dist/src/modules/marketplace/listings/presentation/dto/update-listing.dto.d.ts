import { VisibilityTypeEnum } from './create-listing.dto';
export declare class UpdateListingDto {
    title?: string;
    description?: string;
    shortDescription?: string;
    categoryId?: string;
    subcategoryId?: string;
    mediaUrls?: string[];
    basePrice?: number;
    mrp?: number;
    minOrderQty?: number;
    maxOrderQty?: number;
    hsnCode?: string;
    gstRate?: number;
    stockAvailable?: number;
    visibility?: VisibilityTypeEnum;
    visibilityConfig?: Record<string, unknown>;
    publishAt?: string;
    expiresAt?: string;
    attributes?: Record<string, any>;
    keywords?: string[];
    shippingConfig?: Record<string, unknown>;
    requirementConfig?: Record<string, unknown>;
    trackInventory?: boolean;
}

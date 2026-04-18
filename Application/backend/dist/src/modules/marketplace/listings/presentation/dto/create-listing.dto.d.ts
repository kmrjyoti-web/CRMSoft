export declare enum ListingTypeEnum {
    PRODUCT = "PRODUCT",
    SERVICE = "SERVICE",
    REQUIREMENT = "REQUIREMENT",
    JOB = "JOB"
}
export declare enum VisibilityTypeEnum {
    PUBLIC = "PUBLIC",
    GEO_TARGETED = "GEO_TARGETED",
    VERIFIED_ONLY = "VERIFIED_ONLY",
    MY_CONTACTS = "MY_CONTACTS",
    SELECTED_CONTACTS = "SELECTED_CONTACTS",
    CATEGORY_BASED = "CATEGORY_BASED",
    GRADE_BASED = "GRADE_BASED"
}
export declare class PriceTierDto {
    label: string;
    minQty: number;
    maxQty?: number;
    pricePerUnit: number;
    requiresVerification?: boolean;
}
export declare class CreateListingDto {
    listingType: ListingTypeEnum;
    title: string;
    description?: string;
    shortDescription?: string;
    categoryId?: string;
    subcategoryId?: string;
    mediaUrls?: string[];
    currency?: string;
    basePrice?: number;
    mrp?: number;
    minOrderQty?: number;
    maxOrderQty?: number;
    hsnCode?: string;
    gstRate?: number;
    trackInventory?: boolean;
    stockAvailable?: number;
    visibility?: VisibilityTypeEnum;
    visibilityConfig?: Record<string, unknown>;
    publishAt?: string;
    expiresAt?: string;
    attributes?: Record<string, any>;
    keywords?: string[];
    shippingConfig?: Record<string, unknown>;
    requirementConfig?: Record<string, unknown>;
    priceTiers?: PriceTierDto[];
}

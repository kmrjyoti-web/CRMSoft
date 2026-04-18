export declare class CreateListingCommand {
    readonly tenantId: string;
    readonly authorId: string;
    readonly listingType: string;
    readonly title: string;
    readonly createdById: string;
    readonly description?: string | undefined;
    readonly shortDescription?: string | undefined;
    readonly categoryId?: string | undefined;
    readonly subcategoryId?: string | undefined;
    readonly mediaUrls?: any[] | undefined;
    readonly currency?: string | undefined;
    readonly basePrice?: number | undefined;
    readonly mrp?: number | undefined;
    readonly minOrderQty?: number | undefined;
    readonly maxOrderQty?: number | undefined;
    readonly hsnCode?: string | undefined;
    readonly gstRate?: number | undefined;
    readonly trackInventory?: boolean | undefined;
    readonly stockAvailable?: number | undefined;
    readonly visibility?: string | undefined;
    readonly visibilityConfig?: Record<string, unknown> | undefined;
    readonly publishAt?: Date | undefined;
    readonly expiresAt?: Date | undefined;
    readonly attributes?: Record<string, any> | undefined;
    readonly keywords?: string[] | undefined;
    readonly shippingConfig?: Record<string, unknown> | undefined;
    readonly requirementConfig?: Record<string, unknown> | undefined;
    readonly priceTiers?: Array<{
        label: string;
        minQty: number;
        maxQty?: number;
        pricePerUnit: number;
        requiresVerification?: boolean;
    }> | undefined;
    constructor(tenantId: string, authorId: string, listingType: string, title: string, createdById: string, description?: string | undefined, shortDescription?: string | undefined, categoryId?: string | undefined, subcategoryId?: string | undefined, mediaUrls?: any[] | undefined, currency?: string | undefined, basePrice?: number | undefined, mrp?: number | undefined, minOrderQty?: number | undefined, maxOrderQty?: number | undefined, hsnCode?: string | undefined, gstRate?: number | undefined, trackInventory?: boolean | undefined, stockAvailable?: number | undefined, visibility?: string | undefined, visibilityConfig?: Record<string, unknown> | undefined, publishAt?: Date | undefined, expiresAt?: Date | undefined, attributes?: Record<string, any> | undefined, keywords?: string[] | undefined, shippingConfig?: Record<string, unknown> | undefined, requirementConfig?: Record<string, unknown> | undefined, priceTiers?: Array<{
        label: string;
        minQty: number;
        maxQty?: number;
        pricePerUnit: number;
        requiresVerification?: boolean;
    }> | undefined);
}

export declare class UpdateListingCommand {
    readonly id: string;
    readonly tenantId: string;
    readonly updatedById: string;
    readonly title?: string | undefined;
    readonly description?: string | undefined;
    readonly shortDescription?: string | undefined;
    readonly categoryId?: string | undefined;
    readonly subcategoryId?: string | undefined;
    readonly mediaUrls?: any[] | undefined;
    readonly basePrice?: number | undefined;
    readonly mrp?: number | undefined;
    readonly minOrderQty?: number | undefined;
    readonly maxOrderQty?: number | undefined;
    readonly hsnCode?: string | undefined;
    readonly gstRate?: number | undefined;
    readonly stockAvailable?: number | undefined;
    readonly visibility?: string | undefined;
    readonly visibilityConfig?: Record<string, unknown> | undefined;
    readonly publishAt?: Date | undefined;
    readonly expiresAt?: Date | undefined;
    readonly attributes?: Record<string, any> | undefined;
    readonly keywords?: string[] | undefined;
    readonly shippingConfig?: Record<string, unknown> | undefined;
    readonly requirementConfig?: Record<string, unknown> | undefined;
    constructor(id: string, tenantId: string, updatedById: string, title?: string | undefined, description?: string | undefined, shortDescription?: string | undefined, categoryId?: string | undefined, subcategoryId?: string | undefined, mediaUrls?: any[] | undefined, basePrice?: number | undefined, mrp?: number | undefined, minOrderQty?: number | undefined, maxOrderQty?: number | undefined, hsnCode?: string | undefined, gstRate?: number | undefined, stockAvailable?: number | undefined, visibility?: string | undefined, visibilityConfig?: Record<string, unknown> | undefined, publishAt?: Date | undefined, expiresAt?: Date | undefined, attributes?: Record<string, any> | undefined, keywords?: string[] | undefined, shippingConfig?: Record<string, unknown> | undefined, requirementConfig?: Record<string, unknown> | undefined);
}

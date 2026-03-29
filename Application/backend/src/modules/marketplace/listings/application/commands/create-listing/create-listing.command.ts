export class CreateListingCommand {
  constructor(
    public readonly tenantId: string,
    public readonly authorId: string,
    public readonly listingType: string,
    public readonly title: string,
    public readonly createdById: string,
    public readonly description?: string,
    public readonly shortDescription?: string,
    public readonly categoryId?: string,
    public readonly subcategoryId?: string,
    public readonly mediaUrls?: any[],
    public readonly currency?: string,
    public readonly basePrice?: number,
    public readonly mrp?: number,
    public readonly minOrderQty?: number,
    public readonly maxOrderQty?: number,
    public readonly hsnCode?: string,
    public readonly gstRate?: number,
    public readonly trackInventory?: boolean,
    public readonly stockAvailable?: number,
    public readonly visibility?: string,
    public readonly visibilityConfig?: any,
    public readonly publishAt?: Date,
    public readonly expiresAt?: Date,
    public readonly attributes?: Record<string, any>,
    public readonly keywords?: string[],
    public readonly shippingConfig?: any,
    public readonly requirementConfig?: any,
    public readonly priceTiers?: Array<{
      label: string;
      minQty: number;
      maxQty?: number;
      pricePerUnit: number;
      requiresVerification?: boolean;
    }>,
  ) {}
}

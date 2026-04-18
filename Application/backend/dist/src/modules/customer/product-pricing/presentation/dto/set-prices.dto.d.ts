export declare enum PriceTypeEnum {
    MRP = "MRP",
    SALE_PRICE = "SALE_PRICE",
    PURCHASE_PRICE = "PURCHASE_PRICE",
    DEALER_PRICE = "DEALER_PRICE",
    DISTRIBUTOR_PRICE = "DISTRIBUTOR_PRICE",
    SPECIAL_PRICE = "SPECIAL_PRICE"
}
export declare class PriceEntryDto {
    priceType: PriceTypeEnum;
    amount: number;
    priceGroupId?: string;
    minQty?: number;
    maxQty?: number;
    validFrom?: string;
    validTo?: string;
}
export declare class SetPricesDto {
    prices: PriceEntryDto[];
}
export declare class BulkPriceUpdateDto {
    updates: BulkPriceItemDto[];
}
export declare class BulkPriceItemDto {
    productId: string;
    prices: PriceEntryDto[];
}
export declare class SetSlabPriceEntryDto {
    minQty: number;
    maxQty?: number;
    amount: number;
}
export declare class SetSlabPricesDto {
    priceType: PriceTypeEnum;
    slabs: SetSlabPriceEntryDto[];
}

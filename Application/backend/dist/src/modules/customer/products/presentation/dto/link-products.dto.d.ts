export declare enum ProductRelationType {
    VARIANT = "VARIANT",
    ACCESSORY = "ACCESSORY",
    UPSELL = "UPSELL",
    CROSS_SELL = "CROSS_SELL",
    BUNDLE_ITEM = "BUNDLE_ITEM",
    SUBSTITUTE = "SUBSTITUTE"
}
export declare class LinkProductsDto {
    toProductId: string;
    relationType: ProductRelationType;
}

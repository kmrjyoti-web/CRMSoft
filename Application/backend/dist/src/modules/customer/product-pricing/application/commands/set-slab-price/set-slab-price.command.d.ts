export declare class SetSlabPriceCommand {
    readonly productId: string;
    readonly priceType: string;
    readonly slabs: {
        minQty: number;
        maxQty?: number;
        amount: number;
    }[];
    constructor(productId: string, priceType: string, slabs: {
        minQty: number;
        maxQty?: number;
        amount: number;
    }[]);
}

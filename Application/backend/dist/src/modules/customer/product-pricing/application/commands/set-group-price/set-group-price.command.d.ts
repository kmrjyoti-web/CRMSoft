export declare class SetGroupPriceCommand {
    readonly productId: string;
    readonly priceGroupId: string;
    readonly priceType: string;
    readonly amount: number;
    constructor(productId: string, priceGroupId: string, priceType: string, amount: number);
}

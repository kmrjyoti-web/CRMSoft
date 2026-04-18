declare class ConversionItem {
    fromUnit: string;
    toUnit: string;
    conversionRate: number;
    isDefault?: boolean;
}
export declare class SetConversionsDto {
    conversions: ConversionItem[];
}
export declare class ConvertDto {
    productId: string;
    quantity: number;
    fromUnit: string;
    toUnit: string;
}
export {};

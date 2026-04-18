export declare class CreateServiceRateDto {
    serviceKey: string;
    displayName: string;
    category: string;
    baseTokens: number;
    marginPct?: number;
    description?: string;
}
export declare class UpdateServiceRateDto {
    displayName?: string;
    category?: string;
    baseTokens?: number;
    marginPct?: number;
    description?: string;
    isActive?: boolean;
}

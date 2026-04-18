export declare class CreateRechargePlanDto {
    name: string;
    amount: number;
    tokens: number;
    bonusTokens?: number;
    description?: string;
    sortOrder?: number;
}
export declare class UpdateRechargePlanDto {
    name?: string;
    amount?: number;
    tokens?: number;
    bonusTokens?: number;
    description?: string;
    sortOrder?: number;
    isActive?: boolean;
}

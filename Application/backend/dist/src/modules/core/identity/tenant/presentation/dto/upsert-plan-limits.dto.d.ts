declare class PlanLimitItemDto {
    resourceKey: string;
    limitType: 'TOTAL' | 'MONTHLY' | 'UNLIMITED' | 'DISABLED';
    limitValue?: number;
    isChargeable?: boolean;
    chargeTokens?: number;
}
export declare class UpsertPlanLimitsDto {
    limits: PlanLimitItemDto[];
}
export {};

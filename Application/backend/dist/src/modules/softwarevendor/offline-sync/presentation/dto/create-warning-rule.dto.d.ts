export declare class CreateWarningRuleDto {
    policyId?: string;
    name: string;
    description?: string;
    trigger: string;
    thresholdValue: number;
    thresholdUnit: string;
    level1Action?: string;
    level1Threshold?: number;
    level1Message?: string;
    level2Action?: string;
    level2Threshold?: number;
    level2Message?: string;
    level2DelayMinutes?: number;
    level3Action?: string;
    level3Threshold?: number;
    level3Message?: string;
    appliesToRoles?: string[];
    appliesToUsers?: string[];
    priority?: number;
}

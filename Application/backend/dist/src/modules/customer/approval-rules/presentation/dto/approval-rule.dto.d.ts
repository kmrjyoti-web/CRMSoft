export declare class CreateApprovalRuleDto {
    entityType: string;
    action: string;
    checkerRole: string;
    minCheckers?: number;
    skipForRoles?: string[];
    amountField?: string;
    amountThreshold?: number;
    expiryHours?: number;
}
export declare class UpdateApprovalRuleDto {
    checkerRole?: string;
    minCheckers?: number;
    skipForRoles?: string[];
    amountField?: string;
    amountThreshold?: number;
    expiryHours?: number;
    isActive?: boolean;
}

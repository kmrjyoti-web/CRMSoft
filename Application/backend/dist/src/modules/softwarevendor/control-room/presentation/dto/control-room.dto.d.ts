export declare class UpdateRuleDto {
    value: Record<string, unknown>;
    level: string;
    pageCode?: string;
    roleId?: string;
    userId?: string;
    changeReason?: string;
}
export declare class ResetRuleDto {
    level: string;
    pageCode?: string;
    roleId?: string;
    userId?: string;
    changeReason?: string;
}
export declare class RuleQueryDto {
    category?: string;
    search?: string;
}
export declare class AuditQueryDto {
    level?: string;
    changedByUserId?: string;
    startDate?: string;
    endDate?: string;
    page?: string;
    limit?: string;
}

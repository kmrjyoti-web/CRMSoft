export declare class UpdateTransitionDto {
    name?: string;
    triggerType?: string;
    conditions?: Record<string, unknown>;
    actions?: Record<string, unknown>;
    requiredPermission?: string;
    requiredRole?: string;
    sortOrder?: number;
    isActive?: boolean;
}

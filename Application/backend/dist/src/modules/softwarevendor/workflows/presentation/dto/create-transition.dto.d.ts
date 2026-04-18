export declare class CreateTransitionDto {
    fromStateId: string;
    toStateId: string;
    name: string;
    code: string;
    triggerType?: string;
    conditions?: Record<string, unknown>;
    actions?: Record<string, unknown>;
    requiredPermission?: string;
    requiredRole?: string;
    sortOrder?: number;
}

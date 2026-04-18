export declare class UpdateTransitionCommand {
    readonly transitionId: string;
    readonly data: {
        name?: string;
        triggerType?: string;
        conditions?: Record<string, unknown>;
        actions?: Record<string, unknown>;
        requiredPermission?: string;
        requiredRole?: string;
        sortOrder?: number;
        isActive?: boolean;
    };
    constructor(transitionId: string, data: {
        name?: string;
        triggerType?: string;
        conditions?: Record<string, unknown>;
        actions?: Record<string, unknown>;
        requiredPermission?: string;
        requiredRole?: string;
        sortOrder?: number;
        isActive?: boolean;
    });
}

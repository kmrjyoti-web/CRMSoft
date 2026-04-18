export declare class AddTransitionCommand {
    readonly workflowId: string;
    readonly fromStateId: string;
    readonly toStateId: string;
    readonly name: string;
    readonly code: string;
    readonly triggerType?: string | undefined;
    readonly conditions?: Record<string, unknown> | undefined;
    readonly actions?: Record<string, unknown> | undefined;
    readonly requiredPermission?: string | undefined;
    readonly requiredRole?: string | undefined;
    readonly sortOrder?: number | undefined;
    constructor(workflowId: string, fromStateId: string, toStateId: string, name: string, code: string, triggerType?: string | undefined, conditions?: Record<string, unknown> | undefined, actions?: Record<string, unknown> | undefined, requiredPermission?: string | undefined, requiredRole?: string | undefined, sortOrder?: number | undefined);
}

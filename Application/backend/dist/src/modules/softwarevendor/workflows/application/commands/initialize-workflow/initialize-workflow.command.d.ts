export declare class InitializeWorkflowCommand {
    readonly entityType: string;
    readonly entityId: string;
    readonly userId: string;
    readonly workflowId?: string | undefined;
    constructor(entityType: string, entityId: string, userId: string, workflowId?: string | undefined);
}

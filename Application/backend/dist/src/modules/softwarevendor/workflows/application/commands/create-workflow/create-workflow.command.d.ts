export declare class CreateWorkflowCommand {
    readonly name: string;
    readonly code: string;
    readonly entityType: string;
    readonly createdById: string;
    readonly description?: string | undefined;
    readonly isDefault?: boolean | undefined;
    readonly configJson?: Record<string, unknown> | undefined;
    constructor(name: string, code: string, entityType: string, createdById: string, description?: string | undefined, isDefault?: boolean | undefined, configJson?: Record<string, unknown> | undefined);
}

export declare class AddStateCommand {
    readonly workflowId: string;
    readonly name: string;
    readonly code: string;
    readonly stateType: string;
    readonly category?: string | undefined;
    readonly color?: string | undefined;
    readonly icon?: string | undefined;
    readonly sortOrder?: number | undefined;
    readonly metadata?: Record<string, unknown> | undefined;
    constructor(workflowId: string, name: string, code: string, stateType: string, category?: string | undefined, color?: string | undefined, icon?: string | undefined, sortOrder?: number | undefined, metadata?: Record<string, unknown> | undefined);
}

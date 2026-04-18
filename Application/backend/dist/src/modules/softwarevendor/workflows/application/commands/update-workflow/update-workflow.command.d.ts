export declare class UpdateWorkflowCommand {
    readonly id: string;
    readonly data: {
        name?: string;
        description?: string;
        isDefault?: boolean;
        isActive?: boolean;
        configJson?: Record<string, unknown>;
    };
    constructor(id: string, data: {
        name?: string;
        description?: string;
        isDefault?: boolean;
        isActive?: boolean;
        configJson?: Record<string, unknown>;
    });
}

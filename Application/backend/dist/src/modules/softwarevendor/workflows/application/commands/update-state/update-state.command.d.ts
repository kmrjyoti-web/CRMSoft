export declare class UpdateStateCommand {
    readonly stateId: string;
    readonly data: {
        name?: string;
        category?: string;
        color?: string;
        icon?: string;
        sortOrder?: number;
        metadata?: Record<string, unknown>;
        isActive?: boolean;
    };
    constructor(stateId: string, data: {
        name?: string;
        category?: string;
        color?: string;
        icon?: string;
        sortOrder?: number;
        metadata?: Record<string, unknown>;
        isActive?: boolean;
    });
}

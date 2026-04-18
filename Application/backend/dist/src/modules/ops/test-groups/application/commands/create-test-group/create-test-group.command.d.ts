export declare class CreateTestGroupCommand {
    readonly tenantId: string;
    readonly userId: string;
    readonly dto: {
        name: string;
        nameHi?: string;
        description?: string;
        icon?: string;
        color?: string;
        modules: string[];
        steps: Record<string, unknown>[];
        estimatedDuration?: number;
    };
    constructor(tenantId: string, userId: string, dto: {
        name: string;
        nameHi?: string;
        description?: string;
        icon?: string;
        color?: string;
        modules: string[];
        steps: Record<string, unknown>[];
        estimatedDuration?: number;
    });
}

export declare class UpdateTestGroupCommand {
    readonly id: string;
    readonly dto: {
        name?: string;
        nameHi?: string;
        description?: string;
        icon?: string;
        color?: string;
        modules?: string[];
        steps?: Record<string, unknown>[];
        status?: string;
        estimatedDuration?: number;
    };
    constructor(id: string, dto: {
        name?: string;
        nameHi?: string;
        description?: string;
        icon?: string;
        color?: string;
        modules?: string[];
        steps?: Record<string, unknown>[];
        status?: string;
        estimatedDuration?: number;
    });
}

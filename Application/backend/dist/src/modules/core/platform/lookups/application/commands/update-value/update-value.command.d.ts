export declare class UpdateValueCommand {
    readonly valueId: string;
    readonly data: {
        label?: string;
        icon?: string;
        color?: string;
        isDefault?: boolean;
        configJson?: Record<string, unknown>;
    };
    constructor(valueId: string, data: {
        label?: string;
        icon?: string;
        color?: string;
        isDefault?: boolean;
        configJson?: Record<string, unknown>;
    });
}

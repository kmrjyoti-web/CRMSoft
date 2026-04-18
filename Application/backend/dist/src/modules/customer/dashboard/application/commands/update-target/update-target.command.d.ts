export declare class UpdateTargetCommand {
    readonly id: string;
    readonly targetValue?: number | undefined;
    readonly name?: string | undefined;
    readonly notes?: string | undefined;
    readonly isActive?: boolean | undefined;
    constructor(id: string, targetValue?: number | undefined, name?: string | undefined, notes?: string | undefined, isActive?: boolean | undefined);
}

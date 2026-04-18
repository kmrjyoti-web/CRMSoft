export declare class AutoAssignCommand {
    readonly entityType: string;
    readonly entityId: string;
    readonly triggerEvent: string;
    readonly performedById?: string | undefined;
    constructor(entityType: string, entityId: string, triggerEvent: string, performedById?: string | undefined);
}

export declare class CreateAuditLogCommand {
    readonly entityType: string;
    readonly entityId: string;
    readonly action: string;
    readonly summary: string;
    readonly source: string;
    readonly performedById?: string | undefined;
    readonly performedByName?: string | undefined;
    readonly module?: string | undefined;
    readonly changes?: Array<{
        field: string;
        oldValue?: string;
        newValue?: string;
    }> | undefined;
    readonly correlationId?: string | undefined;
    readonly tags?: string[] | undefined;
    constructor(entityType: string, entityId: string, action: string, summary: string, source: string, performedById?: string | undefined, performedByName?: string | undefined, module?: string | undefined, changes?: Array<{
        field: string;
        oldValue?: string;
        newValue?: string;
    }> | undefined, correlationId?: string | undefined, tags?: string[] | undefined);
}

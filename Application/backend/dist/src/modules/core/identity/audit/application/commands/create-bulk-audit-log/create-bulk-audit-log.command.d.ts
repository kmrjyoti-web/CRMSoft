export declare class CreateBulkAuditLogCommand {
    readonly entityType: string;
    readonly entityIds: string[];
    readonly action: string;
    readonly summary: string;
    readonly source: string;
    readonly performedById?: string | undefined;
    readonly performedByName?: string | undefined;
    readonly module?: string | undefined;
    readonly correlationId?: string | undefined;
    constructor(entityType: string, entityIds: string[], action: string, summary: string, source: string, performedById?: string | undefined, performedByName?: string | undefined, module?: string | undefined, correlationId?: string | undefined);
}

export declare class BulkAssignCommand {
    readonly entityType: string;
    readonly entityIds: string[];
    readonly userId: string;
    readonly ownerType: string;
    readonly reason: string;
    readonly assignedById: string;
    constructor(entityType: string, entityIds: string[], userId: string, ownerType: string, reason: string, assignedById: string);
}

export declare class BulkAssignTaskCommand {
    readonly taskIds: string[];
    readonly assignedToId: string;
    readonly userId: string;
    readonly roleLevel: number;
    readonly tenantId: string;
    constructor(taskIds: string[], assignedToId: string, userId: string, roleLevel: number, tenantId: string);
}

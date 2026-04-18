export declare class CreateFollowUpCommand {
    readonly title: string;
    readonly dueDate: Date;
    readonly assignedToId: string;
    readonly createdById: string;
    readonly entityType: string;
    readonly entityId: string;
    readonly description?: string | undefined;
    readonly priority?: string | undefined;
    constructor(title: string, dueDate: Date, assignedToId: string, createdById: string, entityType: string, entityId: string, description?: string | undefined, priority?: string | undefined);
}

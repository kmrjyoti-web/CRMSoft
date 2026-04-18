export declare class AssignOwnerCommand {
    readonly entityType: string;
    readonly entityId: string;
    readonly userId: string;
    readonly ownerType: string;
    readonly assignedById: string;
    readonly reason: string;
    readonly reasonDetail?: string | undefined;
    readonly method?: string | undefined;
    readonly validFrom?: Date | undefined;
    readonly validTo?: Date | undefined;
    constructor(entityType: string, entityId: string, userId: string, ownerType: string, assignedById: string, reason: string, reasonDetail?: string | undefined, method?: string | undefined, validFrom?: Date | undefined, validTo?: Date | undefined);
}

export declare class RevokeOwnerCommand {
    readonly entityType: string;
    readonly entityId: string;
    readonly userId: string;
    readonly ownerType: string;
    readonly revokedById: string;
    readonly reason: string;
    constructor(entityType: string, entityId: string, userId: string, ownerType: string, revokedById: string, reason: string);
}

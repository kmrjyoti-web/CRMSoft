export declare class TransferOwnerCommand {
    readonly entityType: string;
    readonly entityId: string;
    readonly fromUserId: string;
    readonly toUserId: string;
    readonly ownerType: string;
    readonly transferredById: string;
    readonly reason: string;
    readonly reasonDetail?: string | undefined;
    constructor(entityType: string, entityId: string, fromUserId: string, toUserId: string, ownerType: string, transferredById: string, reason: string, reasonDetail?: string | undefined);
}

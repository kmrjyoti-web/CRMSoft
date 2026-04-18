export declare class BulkTransferCommand {
    readonly fromUserId: string;
    readonly toUserId: string;
    readonly transferredById: string;
    readonly reason: string;
    readonly reasonDetail?: string | undefined;
    readonly entityType?: string | undefined;
    constructor(fromUserId: string, toUserId: string, transferredById: string, reason: string, reasonDetail?: string | undefined, entityType?: string | undefined);
}

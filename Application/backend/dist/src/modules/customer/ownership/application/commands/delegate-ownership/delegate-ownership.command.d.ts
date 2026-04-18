export declare class DelegateOwnershipCommand {
    readonly fromUserId: string;
    readonly toUserId: string;
    readonly startDate: Date;
    readonly endDate: Date;
    readonly reason: string;
    readonly delegatedById: string;
    readonly entityType?: string | undefined;
    constructor(fromUserId: string, toUserId: string, startDate: Date, endDate: Date, reason: string, delegatedById: string, entityType?: string | undefined);
}

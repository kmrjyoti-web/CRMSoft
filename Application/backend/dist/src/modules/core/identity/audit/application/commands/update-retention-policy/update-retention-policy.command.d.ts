export declare class UpdateRetentionPolicyCommand {
    readonly entityType: string;
    readonly retentionDays: number;
    readonly archiveEnabled?: boolean | undefined;
    readonly isActive?: boolean | undefined;
    constructor(entityType: string, retentionDays: number, archiveEnabled?: boolean | undefined, isActive?: boolean | undefined);
}

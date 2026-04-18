export declare class RollbackVersionCommand {
    readonly versionId: string;
    readonly rolledBackBy: string;
    readonly rollbackReason: string;
    constructor(versionId: string, rolledBackBy: string, rollbackReason: string);
}

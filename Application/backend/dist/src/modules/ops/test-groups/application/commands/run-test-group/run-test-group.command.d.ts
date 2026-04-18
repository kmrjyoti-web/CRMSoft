export declare class RunTestGroupCommand {
    readonly tenantId: string;
    readonly userId: string;
    readonly groupId: string;
    readonly testEnvId?: string | undefined;
    constructor(tenantId: string, userId: string, groupId: string, testEnvId?: string | undefined);
}

export declare class CreateTestRunCommand {
    readonly tenantId: string;
    readonly userId: string;
    readonly testTypes: string[];
    readonly targetModules: string[];
    readonly runType: string;
    readonly testEnvId?: string | undefined;
    constructor(tenantId: string, userId: string, testTypes: string[], targetModules: string[], runType: string, testEnvId?: string | undefined);
}

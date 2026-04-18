export declare class CreateScheduledTestCommand {
    readonly tenantId: string;
    readonly userId: string;
    readonly name: string;
    readonly cronExpression: string;
    readonly targetModules: string[];
    readonly testTypes: string[];
    readonly description?: string | undefined;
    readonly dbSourceType?: string | undefined;
    constructor(tenantId: string, userId: string, name: string, cronExpression: string, targetModules: string[], testTypes: string[], description?: string | undefined, dbSourceType?: string | undefined);
}

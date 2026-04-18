export declare class UpdateScheduledTestCommand {
    readonly id: string;
    readonly tenantId: string;
    readonly name?: string | undefined;
    readonly description?: string | undefined;
    readonly cronExpression?: string | undefined;
    readonly targetModules?: string[] | undefined;
    readonly testTypes?: string[] | undefined;
    readonly dbSourceType?: string | undefined;
    readonly isActive?: boolean | undefined;
    constructor(id: string, tenantId: string, name?: string | undefined, description?: string | undefined, cronExpression?: string | undefined, targetModules?: string[] | undefined, testTypes?: string[] | undefined, dbSourceType?: string | undefined, isActive?: boolean | undefined);
}

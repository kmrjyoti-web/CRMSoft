export declare class UpdateTestPlanCommand {
    readonly id: string;
    readonly tenantId: string;
    readonly name?: string | undefined;
    readonly description?: string | undefined;
    readonly version?: string | undefined;
    readonly targetModules?: string[] | undefined;
    readonly status?: string | undefined;
    constructor(id: string, tenantId: string, name?: string | undefined, description?: string | undefined, version?: string | undefined, targetModules?: string[] | undefined, status?: string | undefined);
}

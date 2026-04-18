export declare class UpdateTestPlanItemCommand {
    readonly itemId: string;
    readonly planId: string;
    readonly tenantId: string;
    readonly userId: string;
    readonly status?: string | undefined;
    readonly notes?: string | undefined;
    readonly errorDetails?: string | undefined;
    readonly priority?: string | undefined;
    readonly moduleName?: string | undefined;
    readonly componentName?: string | undefined;
    readonly functionality?: string | undefined;
    readonly layer?: string | undefined;
    constructor(itemId: string, planId: string, tenantId: string, userId: string, status?: string | undefined, notes?: string | undefined, errorDetails?: string | undefined, priority?: string | undefined, moduleName?: string | undefined, componentName?: string | undefined, functionality?: string | undefined, layer?: string | undefined);
}

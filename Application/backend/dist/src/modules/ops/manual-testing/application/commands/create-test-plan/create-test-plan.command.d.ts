export declare class CreateTestPlanCommand {
    readonly tenantId: string;
    readonly userId: string;
    readonly name: string;
    readonly description: string | undefined;
    readonly version: string | undefined;
    readonly targetModules: string[];
    readonly items: Array<{
        moduleName: string;
        componentName: string;
        functionality: string;
        layer: string;
        priority?: string;
    }>;
    constructor(tenantId: string, userId: string, name: string, description: string | undefined, version: string | undefined, targetModules: string[], items: Array<{
        moduleName: string;
        componentName: string;
        functionality: string;
        layer: string;
        priority?: string;
    }>);
}

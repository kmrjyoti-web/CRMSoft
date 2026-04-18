export declare class UpdateTenantCommand {
    readonly tenantId: string;
    readonly name?: string | undefined;
    readonly domain?: string | undefined;
    readonly logo?: string | undefined;
    readonly settings?: Record<string, any> | undefined;
    constructor(tenantId: string, name?: string | undefined, domain?: string | undefined, logo?: string | undefined, settings?: Record<string, any> | undefined);
}

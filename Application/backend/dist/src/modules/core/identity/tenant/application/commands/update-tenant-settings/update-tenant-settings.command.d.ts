export declare class UpdateTenantSettingsCommand {
    readonly tenantId: string;
    readonly settings: Record<string, any>;
    constructor(tenantId: string, settings: Record<string, any>);
}

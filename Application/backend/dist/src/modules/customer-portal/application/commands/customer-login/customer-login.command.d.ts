export declare class CustomerLoginCommand {
    readonly email: string;
    readonly password: string;
    readonly tenantId: string;
    readonly ipAddress?: string | undefined;
    readonly userAgent?: string | undefined;
    constructor(email: string, password: string, tenantId: string, ipAddress?: string | undefined, userAgent?: string | undefined);
}

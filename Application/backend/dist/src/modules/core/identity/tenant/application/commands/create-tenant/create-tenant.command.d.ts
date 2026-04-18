export declare class CreateTenantCommand {
    readonly name: string;
    readonly slug: string;
    readonly adminEmail: string;
    readonly adminPassword: string;
    readonly adminFirstName: string;
    readonly adminLastName: string;
    readonly planId: string;
    constructor(name: string, slug: string, adminEmail: string, adminPassword: string, adminFirstName: string, adminLastName: string, planId: string);
}

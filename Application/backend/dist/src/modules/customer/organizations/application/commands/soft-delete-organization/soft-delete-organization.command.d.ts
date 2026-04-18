export declare class SoftDeleteOrganizationCommand {
    readonly organizationId: string;
    readonly deletedById: string;
    constructor(organizationId: string, deletedById: string);
}

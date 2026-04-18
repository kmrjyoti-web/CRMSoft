export declare class LinkContactToOrgCommand {
    readonly contactId: string;
    readonly organizationId: string;
    readonly relationType?: string | undefined;
    readonly isPrimary?: boolean | undefined;
    readonly designation?: string | undefined;
    readonly department?: string | undefined;
    readonly startDate?: Date | undefined;
    constructor(contactId: string, organizationId: string, relationType?: string | undefined, isPrimary?: boolean | undefined, designation?: string | undefined, department?: string | undefined, startDate?: Date | undefined);
}

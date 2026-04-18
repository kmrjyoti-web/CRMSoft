export declare class CreateContactCommand {
    readonly firstName: string;
    readonly lastName: string;
    readonly createdById: string;
    readonly designation?: string | undefined;
    readonly department?: string | undefined;
    readonly notes?: string | undefined;
    readonly communications?: Array<{
        type: string;
        value: string;
        priorityType?: string;
        label?: string;
        isPrimary?: boolean;
    }> | undefined;
    readonly organizationId?: string | undefined;
    readonly orgRelationType?: string | undefined;
    readonly filterIds?: string[] | undefined;
    constructor(firstName: string, lastName: string, createdById: string, designation?: string | undefined, department?: string | undefined, notes?: string | undefined, communications?: Array<{
        type: string;
        value: string;
        priorityType?: string;
        label?: string;
        isPrimary?: boolean;
    }> | undefined, organizationId?: string | undefined, orgRelationType?: string | undefined, filterIds?: string[] | undefined);
}

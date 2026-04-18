export declare class UpdateContactCommand {
    readonly contactId: string;
    readonly updatedById: string;
    readonly data: {
        firstName?: string;
        lastName?: string;
        designation?: string;
        department?: string;
        notes?: string;
    };
    readonly filterIds?: string[] | undefined;
    readonly communications?: Array<{
        type: string;
        value: string;
        priorityType?: string;
        label?: string;
        isPrimary?: boolean;
    }> | undefined;
    readonly organizationId?: string | undefined;
    constructor(contactId: string, updatedById: string, data: {
        firstName?: string;
        lastName?: string;
        designation?: string;
        department?: string;
        notes?: string;
    }, filterIds?: string[] | undefined, communications?: Array<{
        type: string;
        value: string;
        priorityType?: string;
        label?: string;
        isPrimary?: boolean;
    }> | undefined, organizationId?: string | undefined);
}

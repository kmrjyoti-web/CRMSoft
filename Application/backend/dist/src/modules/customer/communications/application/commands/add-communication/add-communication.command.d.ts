export declare class AddCommunicationCommand {
    readonly type: string;
    readonly value: string;
    readonly priorityType?: string | undefined;
    readonly isPrimary?: boolean | undefined;
    readonly label?: string | undefined;
    readonly rawContactId?: string | undefined;
    readonly contactId?: string | undefined;
    readonly organizationId?: string | undefined;
    readonly leadId?: string | undefined;
    constructor(type: string, value: string, priorityType?: string | undefined, isPrimary?: boolean | undefined, label?: string | undefined, rawContactId?: string | undefined, contactId?: string | undefined, organizationId?: string | undefined, leadId?: string | undefined);
}

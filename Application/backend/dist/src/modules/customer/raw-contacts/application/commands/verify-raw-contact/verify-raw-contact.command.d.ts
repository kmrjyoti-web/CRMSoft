export declare class VerifyRawContactCommand {
    readonly rawContactId: string;
    readonly verifiedById: string;
    readonly organizationId?: string | undefined;
    readonly contactOrgRelationType?: string | undefined;
    constructor(rawContactId: string, verifiedById: string, organizationId?: string | undefined, contactOrgRelationType?: string | undefined);
}

export declare class AddCampaignRecipientsCommand {
    readonly campaignId: string;
    readonly recipients: {
        email: string;
        firstName?: string;
        lastName?: string;
        companyName?: string;
        contactId?: string;
        mergeData?: Record<string, any>;
    }[];
    constructor(campaignId: string, recipients: {
        email: string;
        firstName?: string;
        lastName?: string;
        companyName?: string;
        contactId?: string;
        mergeData?: Record<string, any>;
    }[]);
}

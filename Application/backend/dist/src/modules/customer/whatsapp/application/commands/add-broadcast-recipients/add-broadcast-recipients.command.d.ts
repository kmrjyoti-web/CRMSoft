export declare class AddBroadcastRecipientsCommand {
    readonly broadcastId: string;
    readonly recipients: {
        phoneNumber: string;
        contactName?: string;
        variables?: Record<string, unknown>;
    }[];
    constructor(broadcastId: string, recipients: {
        phoneNumber: string;
        contactName?: string;
        variables?: Record<string, unknown>;
    }[]);
}

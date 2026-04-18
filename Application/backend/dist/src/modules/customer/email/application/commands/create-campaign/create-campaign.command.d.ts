export declare class CreateCampaignCommand {
    readonly name: string;
    readonly subject: string;
    readonly bodyHtml: string;
    readonly accountId: string;
    readonly userId: string;
    readonly userName: string;
    readonly description?: string | undefined;
    readonly bodyText?: string | undefined;
    readonly fromName?: string | undefined;
    readonly replyToEmail?: string | undefined;
    readonly templateId?: string | undefined;
    readonly sendRatePerMinute?: number | undefined;
    readonly batchSize?: number | undefined;
    readonly trackOpens?: boolean | undefined;
    readonly trackClicks?: boolean | undefined;
    readonly includeUnsubscribe?: boolean | undefined;
    readonly scheduledAt?: Date | undefined;
    constructor(name: string, subject: string, bodyHtml: string, accountId: string, userId: string, userName: string, description?: string | undefined, bodyText?: string | undefined, fromName?: string | undefined, replyToEmail?: string | undefined, templateId?: string | undefined, sendRatePerMinute?: number | undefined, batchSize?: number | undefined, trackOpens?: boolean | undefined, trackClicks?: boolean | undefined, includeUnsubscribe?: boolean | undefined, scheduledAt?: Date | undefined);
}

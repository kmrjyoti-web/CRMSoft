export declare class UpdateCampaignCommand {
    readonly id: string;
    readonly name?: string | undefined;
    readonly description?: string | undefined;
    readonly subject?: string | undefined;
    readonly bodyHtml?: string | undefined;
    readonly bodyText?: string | undefined;
    readonly sendRatePerMinute?: number | undefined;
    readonly scheduledAt?: Date | undefined;
    constructor(id: string, name?: string | undefined, description?: string | undefined, subject?: string | undefined, bodyHtml?: string | undefined, bodyText?: string | undefined, sendRatePerMinute?: number | undefined, scheduledAt?: Date | undefined);
}

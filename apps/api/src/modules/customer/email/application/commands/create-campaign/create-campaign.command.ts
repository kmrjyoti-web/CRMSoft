export class CreateCampaignCommand {
  constructor(
    public readonly name: string,
    public readonly subject: string,
    public readonly bodyHtml: string,
    public readonly accountId: string,
    public readonly userId: string,
    public readonly userName: string,
    public readonly description?: string,
    public readonly bodyText?: string,
    public readonly fromName?: string,
    public readonly replyToEmail?: string,
    public readonly templateId?: string,
    public readonly sendRatePerMinute?: number,
    public readonly batchSize?: number,
    public readonly trackOpens?: boolean,
    public readonly trackClicks?: boolean,
    public readonly includeUnsubscribe?: boolean,
    public readonly scheduledAt?: Date,
  ) {}
}

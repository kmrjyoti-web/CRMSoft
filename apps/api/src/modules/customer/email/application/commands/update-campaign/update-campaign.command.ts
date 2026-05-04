export class UpdateCampaignCommand {
  constructor(
    public readonly id: string,
    public readonly name?: string,
    public readonly description?: string,
    public readonly subject?: string,
    public readonly bodyHtml?: string,
    public readonly bodyText?: string,
    public readonly sendRatePerMinute?: number,
    public readonly scheduledAt?: Date,
  ) {}
}

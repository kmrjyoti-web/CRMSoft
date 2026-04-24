export class StartCampaignCommand {
  constructor(
    public readonly campaignId: string,
    public readonly userId: string,
  ) {}
}

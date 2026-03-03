export class GetCampaignRecipientsQuery {
  constructor(
    public readonly campaignId: string,
    public readonly page: number,
    public readonly limit: number,
    public readonly status?: string,
  ) {}
}

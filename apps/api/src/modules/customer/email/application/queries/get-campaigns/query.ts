export class GetCampaignsQuery {
  constructor(
    public readonly userId: string,
    public readonly page: number,
    public readonly limit: number,
    public readonly status?: string,
  ) {}
}

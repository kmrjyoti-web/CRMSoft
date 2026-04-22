export class GetRankedFeedQuery {
  constructor(
    public readonly tenantId: string,
    public readonly userId: string,
    public readonly page: number = 1,
    public readonly limit: number = 20,
    public readonly category?: string,
    public readonly city?: string,
    public readonly feedType: 'main' | 'following' | 'trending' | 'discover' = 'main',
  ) {}
}

export class GetLeaderboardQuery {
  constructor(
    public readonly dateFrom: Date,
    public readonly dateTo: Date,
    public readonly metric: string,
    public readonly limit?: number,
    public readonly currentUserId?: string,
  ) {}
}

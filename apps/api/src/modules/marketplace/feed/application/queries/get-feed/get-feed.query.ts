export class GetFeedQuery {
  constructor(
    public readonly tenantId: string,
    public readonly userId: string,
    public readonly page: number = 1,
    public readonly limit: number = 20,
    public readonly postType?: string,
    public readonly authorId?: string,
  ) {}
}

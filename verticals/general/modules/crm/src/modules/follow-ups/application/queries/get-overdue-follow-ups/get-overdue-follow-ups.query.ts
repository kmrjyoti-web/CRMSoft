export class GetOverdueFollowUpsQuery {
  constructor(
    public readonly assignedToId?: string,
    public readonly page: number = 1,
    public readonly limit: number = 50,
  ) {}
}

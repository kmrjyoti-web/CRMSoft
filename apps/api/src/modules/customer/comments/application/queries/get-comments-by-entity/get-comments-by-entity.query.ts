export class GetCommentsByEntityQuery {
  constructor(
    public readonly entityType: string,
    public readonly entityId: string,
    public readonly userId: string,
    public readonly roleLevel: number,
    public readonly page: number = 1,
    public readonly limit: number = 50,
  ) {}
}

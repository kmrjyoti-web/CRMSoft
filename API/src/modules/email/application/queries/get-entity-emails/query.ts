export class GetEntityEmailsQuery {
  constructor(
    public readonly entityType: string,
    public readonly entityId: string,
    public readonly page: number,
    public readonly limit: number,
  ) {}
}

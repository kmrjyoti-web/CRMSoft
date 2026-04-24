export class GetUnassignedEntitiesQuery {
  constructor(
    public readonly entityType: string,
    public readonly page?: number,
    public readonly limit?: number,
  ) {}
}

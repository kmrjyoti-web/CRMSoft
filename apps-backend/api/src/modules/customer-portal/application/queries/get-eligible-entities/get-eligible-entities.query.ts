export class GetEligibleEntitiesQuery {
  constructor(
    public readonly tenantId: string,
    public readonly entityType?: string,
    public readonly search?: string,
    public readonly page: number = 1,
    public readonly limit: number = 20,
  ) {}
}

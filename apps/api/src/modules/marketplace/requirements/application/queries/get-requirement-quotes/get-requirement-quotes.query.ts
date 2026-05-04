export class GetRequirementQuotesQuery {
  constructor(
    public readonly requirementId: string,
    public readonly tenantId: string,
    public readonly page: number = 1,
    public readonly limit: number = 20,
  ) {}
}

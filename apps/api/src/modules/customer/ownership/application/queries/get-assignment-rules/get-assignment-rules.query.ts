export class GetAssignmentRulesQuery {
  constructor(
    public readonly entityType?: string,
    public readonly status?: string,
    public readonly page?: number,
    public readonly limit?: number,
  ) {}
}

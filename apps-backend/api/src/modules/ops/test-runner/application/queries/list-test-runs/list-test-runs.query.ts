export class ListTestRunsQuery {
  constructor(
    public readonly tenantId: string,
    public readonly filters: { status?: string; page?: number; limit?: number },
  ) {}
}

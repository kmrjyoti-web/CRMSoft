export class GetScheduledTestQuery {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
  ) {}
}

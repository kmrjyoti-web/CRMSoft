export class GetTeamTasksOverviewQuery {
  constructor(
    public readonly userId: string,
    public readonly roleLevel: number,
    public readonly tenantId: string,
  ) {}
}

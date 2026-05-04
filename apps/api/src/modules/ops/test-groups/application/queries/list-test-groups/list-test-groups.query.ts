export class ListTestGroupsQuery {
  constructor(
    public readonly tenantId: string,
    public readonly filters: { status?: string; module?: string },
  ) {}
}
